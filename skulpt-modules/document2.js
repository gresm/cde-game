// https://github.com/skulpt/skulpt/blob/a2e614061f6a0e0fb80f91aa53bffa86f19f4e68/src/ffi.js#L43
function toPy(obj, hooks) {
    if (obj === null || obj === undefined) {
        return Sk.builtin.none.none$;
    }

    if (obj.sk$object) {
        return obj;
    } else if (obj.$isPyWrapped && obj.unwrap) {
        // wrap protocol
        return obj.unwrap();
    }

    const type = typeof obj;
    hooks = hooks || {};

    if (type === "string") {
        return new Sk.builtin.str(obj);
    } else if (type === "number") {
        return numberToPy(obj);
    } else if (type === "boolean") {
        return new Sk.builtin.bool(obj);
    } else if (type === "function") {
        // should the defualt behaviour be to proxy or new Sk.builtin.func?
        // old remap used to do an Sk.builtin.func
        return hooks.funcHook ? hooks.funcHook(obj) : proxy(obj);
    } else if (JSBI.__isBigInt(obj)) {
        // might be type === "bigint" if bigint native or an array like object for older browsers
        return new Sk.builtin.int_(JSBI.numberIfSafe(obj));
    } else if (Array.isArray(obj)) {
        return new Sk.builtin.list(obj.map((x) => toPy(x, hooks)));
    } else if (type === "object") {
        const constructor = obj.constructor; // it's possible that a library deleted the constructor
        if (constructor === Object && Object.getPrototypeOf(obj) === OBJECT_PROTO || constructor === undefined /* Object.create(null) */) {
            return hooks.dictHook ? hooks.dictHook(obj) : toPyDict(obj, hooks);
        } else if (constructor === Uint8Array) {
            return new Sk.builtin.bytes(obj);
        } else if (constructor === Set) {
            return toPySet(obj, hooks);
        } else if (constructor === Map) {
            const ret = new Sk.builtin.dict();
            obj.forEach((val, key) => {
                ret.mp$ass_subscript(toPy(key, hooks), toPy(val, hooks));
            });
            return ret;
        } else if (constructor === Sk.misceval.Suspension) {
            return obj;
        } else {
            // all objects get proxied - previously they were converted to dictionaries
            // can override this behaviour with a proxy hook
            return hooks.proxyHook ? hooks.proxyHook(obj) : proxy(obj);
        }
    } else if (hooks.unhandledHook) {
        // there aren't very many types left
        // could be a symbol (unlikely)
        return hooks.unhandledHook(obj);
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