// https://github.com/skulpt/skulpt/blob/a2e614061f6a0e0fb80f91aa53bffa86f19f4e68/src/ffi.js#L43
function numberToPy(val) {
    if (Number.isInteger(val)) {
        if (Math.abs(val) < Number.MAX_SAFE_INTEGER) {
            return new Sk.builtin.int_(val);
        }
        return new Sk.builtin.int_(JSBI.BigInt(val));
    }
    return new Sk.builtin.float_(val);
}

function toPyDict(obj, hooks, mapped) {
    const ret = new Sk.builtin.dict();
    Object.entries(obj).forEach(([key, val]) => {
        var s = new Sk.builtin.str(key);
        mapped.set(key, s);
        ret.mp$ass_subscript(s, toPy(val, hooks, mapped));
    });
    return ret;
}

// cache the proxied objects in a weakmap
const _proxied = new WeakMap();

// use proxy if you want to proxy an arbirtrary js object
// the only flags currently used is {bound: some_js_object}
function proxy(obj, flags) {
    if (obj === null || obj === undefined) {
        return Sk.builtin.none.none$;
    }
    const type = typeof obj;
    if (type !== "object" && type !== "function") {
        return toPy(obj); // don't proxy strings, numbers, bigints
    }
    flags = flags || {};
    const cached = _proxied.get(obj);
    if (cached) {
        if (flags.bound === cached.$bound) {
            return cached;
        }
        if (!flags.name) {
            flags.name = cached.$name;
        }
    }
    const ret = new JsProxy(obj, flags);
    _proxied.set(obj, ret);
    return ret;
}

const JsProxy = Sk.abstr.buildNativeClass("Proxy", {
    constructor: function JsProxy(obj, flags) {
        if (obj === undefined) {
            throw new Sk.builtin.TypeError("Proxy cannot be called from python");
        }
        this.js$wrapped = obj;
        this.$module = null;
        this.$methods = Object.create(null);
        this.in$repr = false;


        flags || (flags = {});


        // make slot functions lazy
        Object.defineProperties(this, this.memoized$slots);


        // determine the type and name of this proxy
        if (typeof obj === "function") {
            this.is$callable = true;
            this.$bound = flags.bound;
            this.$name = flags.name || obj.name || "(native JS)";
            if (this.$name.length <= 2) {
                this.$name = this.$name + " (native JS)"; // better this than a single letter minified name
            }
        } else {
            this.is$callable = false;
            delete this.is$type; // set in memoized slots for lazy loading;
            this.is$type = false;
            this.$name = flags.name;
        }
    },
    slots: {
        tp$doc: "proxy for a javascript object",
        tp$hash() {
            return Sk.builtin.object.prototype.tp$hash.call(this.js$wrapped);
        },
        tp$getattr(pyName) {
            return this.$lookup(pyName) || Sk.generic.getAttr.call(this, pyName);
        },
        tp$setattr(pyName, value) {
            const jsName = pyName.toString();
            if (value === undefined) {
                delete this.js$wrapped[jsName];
            } else {
                this.js$wrapped[jsName] = toJs(value, jsHooks);
            }
        },
        $r() {
            if (this.is$callable) {
                if (this.is$type || !this.$bound) {
                    return new Sk.builtin.str("<" + this.tp$name + " '" + this.$name + "'>");
                }
                const boundRepr = Sk.misceval.objectRepr(proxy(this.$bound));
                return new Sk.builtin.str("<bound " + this.tp$name + " '" + this.$name + "' of " + boundRepr + ">");
            } else if (this.js$proto === OBJECT_PROTO) {
                if (this.in$repr) {
                    return new Sk.builtin.str("{...}");
                }
                this.in$repr = true;
                const entries = Object.entries(this.js$wrapped).map(([key, val]) => {
                    val = toPy(val, boundHook(this.js$wrapped, key));
                    return "'" + key + "': " + Sk.misceval.objectRepr(val);
                });
                const ret = new Sk.builtin.str("proxyobject({" + entries.join(", ") + "})");
                this.in$repr = false;
                return ret;
            }
            const object = this.tp$name === "proxyobject" ? "object" : "proxyobject";
            return new Sk.builtin.str("<" + this.tp$name + " " + object + ">");
        },
        tp$as_sequence_or_mapping: true,
        mp$subscript(pyItem) {
            // todo should we account for -1 i.e. array like subscripts
            const ret = this.$lookup(pyItem);
            if (ret === undefined) {
                throw new Sk.builtin.LookupError(pyItem);
            }
            return ret;
        },
        mp$ass_subscript(pyItem, value) {
            return this.tp$setattr(pyItem, value);
        },
        sq$contains(item) {
            return toJs(item) in this.js$wrapped;
        },
        ob$eq(other) {
            return this.js$wrapped === other.js$wrapped;
        },
        ob$ne(other) {
            return this.js$wrapped !== other.js$wrapped;
        },
        tp$as_number: true,
        nb$bool() {
            // we could just check .constructor but some libraries delete it!
            if (this.js$proto === OBJECT_PROTO) {
                return Object.keys(this.js$wrapped).length > 0;
            } else if (this.sq$length) {
                return this.sq$length() > 0;
            } else {
                return true;
            }
        },
    },
    methods: {
        __dir__: {
            $meth() {
                const proxy_dir = Sk.misceval.callsimArray(Sk.builtin.type.prototype.__dir__, [JsProxy]).valueOf();
                return new Sk.builtin.list(proxy_dir.concat(Array.from(this.$dir, (x) => new Sk.builtin.str(x))));
            },
            $flags: { NoArgs: true },
        },
        __new__: {
            // this is effectively a static method
            $meth(js_proxy, ...args) {
                if (!(js_proxy instanceof JsProxy)) {
                    throw new Sk.builtin.TypeError(
                        "expected a proxy object as the first argument not " + Sk.abstr.typeName(js_proxy)
                    );
                }
                try {
                    // let javascript throw errors if it wants
                    return js_proxy.$new(args);
                } catch (e) {
                    if (e instanceof TypeError && e.message.includes("not a constructor")) {
                        throw new Sk.builtin.TypeError(Sk.misceval.objectRepr(js_proxy) + " is not a constructor");
                    }
                    throw e;
                }
            },
            $flags: { MinArgs: 1 },
        },
        __call__: {
            $meth(args, kwargs) {
                if (typeof this.js$wrapped !== "function") {
                    throw new Sk.builtin.TypeError("'" + this.tp$name + "' object is not callable");
                }
                return this.$call(args, kwargs);
            },
            $flags: { FastCall: true },
        },
        keys: {
            $meth() {
                return new Sk.builtin.list(Object.keys(this.js$wrapped).map((x) => new Sk.builtin.str(x)));
            },
            $flags: { NoArgs: true },
        },
        get: {
            $meth(pyName, _default) {
                return this.$lookup(pyName) || _default || Sk.builtin.none.none$;
            },
            $flags: { MinArgs: 1, MaxArgs: 2 },
        },
    },
    getsets: {
        __class__: {
            $get() {
                return toPy(this.js$wrapped.constructor, pyHooks);
            },
            $set() {
                throw new Sk.builtin.TypeError("not writable");
            },
        },
        __name__: {
            $get() {
                return new Sk.builtin.str(this.$name);
            },
        },
        __module__: {
            $get() {
                return this.$module || Sk.builtin.none.none$;
            },
            $set(v) {
                this.$module = v;
            },
        },
    },
    proto: {
        valueOf() {
            return this.js$wrapped;
        },
        $new(args, kwargs) {
            Sk.abstr.checkNoKwargs("__new__", kwargs);
            return toPy(new this.js$wrapped(...args.map((x) => toJs(x, jsHooks))), {
                dictHook: (obj) => proxy(obj),
                proxyHook: (obj) => proxy(obj, { name: this.$name }),
            });
        },
        $call(args, kwargs) {
            Sk.abstr.checkNoKwargs("__call__", kwargs);
            return Sk.misceval.chain(
                this.js$wrapped.apply(
                    this.$bound,
                    args.map((x) => toJs(x, jsHooks))
                ),
                (res) => (res instanceof Promise ? Sk.misceval.promiseToSuspension(res) : res),
                (res) => toPy(res, pyHooks)
            );
        },
        $lookup(pyName) {
            const jsName = pyName.toString();
            const attr = this.js$wrapped[jsName];
            if (attr !== undefined) {
                // here we override the funcHook to pass the bound object
                return toPy(attr, boundHook(this.js$wrapped, jsName));
            } else if (jsName in this.js$wrapped) {
                // do we actually have this property?
                return Sk.builtin.none.none$;
            }
        },
        // only get these if we need them
        memoized$slots: {
            js$proto: {
                configurable: true,
                get() {
                    delete this.js$proto;
                    return (this.js$proto = Object.getPrototypeOf(this.js$wrapped));
                },
            },
            $dir: {
                configurable: true,
                get() {
                    const dir = [];
                    // just looping over enumerable properties can hide a lot of properties
                    // especially in es6 classes
                    let obj = this.js$wrapped;


                    while (obj != null && obj !== OBJECT_PROTO && obj !== FUNC_PROTO) {
                        dir.push(...Object.getOwnPropertyNames(obj));
                        obj = Object.getPrototypeOf(obj);
                    }
                    return new Set(dir);
                },
            },
            tp$iter: {
                configurable: true,
                get() {
                    delete this.tp$iter;
                    if (this.js$wrapped[Symbol.iterator] !== undefined) {
                        return (this.tp$iter = () => {
                            return proxy(this.js$wrapped[Symbol.iterator]());
                        });
                    } else {
                        return (this.tp$iter = () => {
                            // we could set it to undefined but because we have a __getitem__
                            // python tries to use seq_iter which will result in a 0 LookupError, which is confusing
                            throw new Sk.builtin.TypeError(Sk.misceval.objectRepr(this) + " is not iterable");
                        });
                    }
                },
            },
            tp$iternext: {
                configurable: true,
                get() {
                    delete this.tp$iternext;
                    if (this.js$wrapped.next !== undefined) {
                        return (this.tp$iternext = () => {
                            const nxt = this.js$wrapped.next().value;
                            return nxt && toPy(nxt, pyHooks);
                        });
                    }
                },
            },
            sq$length: {
                configurable: true,
                get() {
                    delete this.sq$length;
                    if (!this.is$callable && this.js$wrapped.length !== undefined) {
                        return (this.sq$length = () => this.js$wrapped.length);
                    }
                },
            },
            tp$call: {
                configurable: true,
                get() {
                    delete this.tp$call;
                    if (this.is$callable) {
                        return (this.tp$call = this.is$type ? this.$new : this.$call);
                    }
                },
            },
            tp$name: {
                configurable: true,
                get() {
                    delete this.tp$name;
                    if (!this.is$callable) {
                        const obj = this.js$wrapped;
                        let tp$name =
                            obj[Symbol.toStringTag] ||
                            this.$name ||
                            (obj.constructor && obj.constructor.name) ||
                            "proxyobject";
                        if (tp$name === "Object") {
                            tp$name = this[Symbol.toStringTag];
                            tp$name = "proxyobject";
                        } else if (tp$name.length <= 2) {
                            // we might have a better name in the cache so check there...
                            tp$name = proxy(obj.constructor).$name;
                        }
                        return (this.tp$name = tp$name);
                    } else {
                        return (this.tp$name = this.is$type ? "proxyclass" : this.$bound ? "proxymethod" : "proxyfunction");
                    }
                },
            },
            is$type: {
                configurable: true,
                get() {
                    delete this.is$type;
                    // we already know if we're a function
                    const jsFunc = this.js$wrapped;
                    const proto = jsFunc.prototype;
                    if (proto === undefined) {
                        // Arrow functions and shorthand methods don't get a prototype
                        // neither do native js functions like requestAnimationFrame, JSON.parse
                        // Proxy doesn't get a prototype but must be called with new - it's the only one I know
                        // How you'd use Proxy in python I have no idea
                        return (this.is$type = jsFunc === window.Proxy);
                    }
                    const maybeConstructor = checkBodyIsMaybeConstructor(jsFunc);
                    if (maybeConstructor === true) {
                        // definitely a constructor and needs new
                        return (this.is$type = true);
                    } else if (maybeConstructor === false) {
                        // Number, Symbol, Boolean, BigInt, String
                        return (this.is$type = false);
                    }
                    const protoLen = Object.getOwnPropertyNames(proto).length;
                    if (protoLen > 1) {
                        // if the function object has a prototype with more than just constructor, intention is to be used as a constructor
                        return (this.is$type = true);
                    }
                    return (this.is$type = Object.getPrototypeOf(proto) !== OBJECT_PROTO);
                    // we could be a subclass with only constructor on the prototype
                    // if our prototype's __proto__ is Object.prototype then we are the most base function
                    // the most likely option is that `this` should be whatever `this.$bound` is, rather than using new
                    // example x is this.$bound and shouldn't be called with new
                    // var x = {foo: function() {this.bar='foo'}}
                    // Sk.misceval.Break is a counter example
                    // better to fail with Sk.misceval.Break() (which may have a type guard) than fail by calling new x.foo()
                },
            },
        },
    },
    flags: {
        sk$acceptable_as_base_class: false,
    },
});

function toPySet(obj, hooks, mapped) {
    return new Sk.builtin.set(Array.from(obj, (x) => toPy(x, hooks, mapped)));
}

/**
 * @param {WeakMap<object, object>} mapped
 */
function toPy(obj, hooks, mapped) {
    if (obj === null || obj === undefined) {
        return Sk.builtin.none.none$;
    }

    if (obj.sk$object) {
        return obj;
    } else if (obj.$isPyWrapped && obj.unwrap) {
        // wrap protocol
        return obj.unwrap();
    }

    if (mapped === undefined) {
        mapped = new WeakMap();
    }

    if (mapped.has(obj)) {
        return mapped.get(obj);
    }

    wrap = (val, ob) => {
        mapped.set(ob === undefined? obj: ob, val);
        return val
    }

    const type = typeof obj;
    hooks = hooks || {};

    if (type === "string") {
        return wrap(new Sk.builtin.str(obj));
    } else if (type === "number") {
        return wrap(numberToPy(obj));
    } else if (type === "boolean") {
        return wrap(new Sk.builtin.bool(obj));
    } else if (type === "function") {
        // should the defualt behaviour be to proxy or new Sk.builtin.func?
        // old remap used to do an Sk.builtin.func
        return wrap(hooks.funcHook ? hooks.funcHook(obj) : proxy(obj));
    } else if (JSBI.__isBigInt(obj)) {
        // might be type === "bigint" if bigint native or an array like object for older browsers
        return wrap(new Sk.builtin.int_(JSBI.numberIfSafe(obj)));
    } else if (Array.isArray(obj)) {
        return wrap(new Sk.builtin.list(obj.map((x) => toPy(x, hooks, mapped))));
    } else if (type === "object") {
        const constructor = obj.constructor; // it's possible that a library deleted the constructor
        if (constructor === Object && Object.getPrototypeOf(obj) === OBJECT_PROTO || constructor === undefined /* Object.create(null) */) {
            return wrap(hooks.dictHook ? hooks.dictHook(obj) : toPyDict(obj, hooks));
        } else if (constructor === Uint8Array) {
            return wrap(new Sk.builtin.bytes(obj));
        } else if (constructor === Set) {
            return wrap(toPySet(obj, hooks));
        } else if (constructor === Map) {
            const ret = new Sk.builtin.dict();
            obj.forEach((val, key) => {
                ret.mp$ass_subscript(toPy(key, hooks, mapped), toPy(val, hooks, mapped));
            });
            return wrap(ret);
        } else if (constructor === Sk.misceval.Suspension) {
            return obj;
        } else {
            // all objects get proxied - previously they were converted to dictionaries
            // can override this behaviour with a proxy hook
            return wrap(hooks.proxyHook ? hooks.proxyHook(obj) : proxy(obj));
        }
    } else if (hooks.unhandledHook) {
        // there aren't very many types left
        // could be a symbol (unlikely)
        return wrap(hooks.unhandledHook(obj));
    }
    Sk.asserts.fail("unhandled remap case of type " + type);
}

// New https://github.com/skulpt/skulpt/blob/master/src/lib/document.js implementation, but no release with it avalible yet, so including it here.
function $builtinmodule() {
    const {
        builtin: { str: pyStr },
        ffi: { remapToPy: toPy },
        abstr: { gattr },
    } = Sk;

    const documentMod = { __name__: new pyStr("document") };
    const documentProxy = toPy(Sk.global.document);

    Sk.abstr.setUpModuleMethods("document", documentMod, {
        __getattr__: {
            $meth(pyName) {
                return gattr(documentProxy, pyName, true);
            },
            $flags: { OneArg: true },
        },
        __dir__: {
            $meth() {
                return pyCall(documentProxy.tp$getattr(pyStr.$dir));
            },
            $flags: { NoArgs: true },
        },
    });
    return documentMod;
}