// eslint-disable-next-line @typescript-eslint/no-unused-vars
var $builtinmodule = function () {
    let Sk = globalThis.Sk;

    Sk.gameInterface.hooks = {};

    Sk.gameInterface.hook = function (name) {
        if (Sk.gameInterface.hooks[name] !== undefined) {
            Sk.gameInterface.hooks[name]();
        }
    };

    Sk.gameInterface.wrapPyFunc = function (pyFunc) {
        return () => {
            Sk.misceval.callsimArray(pyFunc, []);
        };
    };

    var mod = {};

    mod.__name__ = new Sk.builtin.str("game_interface");

    mod.get_story = new Sk.builtin.func(function get_story() {
        Sk.abstr.checkArgsLen("get_story", arguments.length, 0, 0);
        return Sk.ffi.remapToPy(Sk.gameInterface.story);
    });

    mod.get_runner = new Sk.builtin.func(function get_runner() {
        Sk.abstr.checkArgsLen("get_runner", arguments.length, 0, 0);
        return Sk.ffi.proxy(Sk.gameInterface.runner);
    });

    mod._debug = new Sk.builtin.func(function _debug(value, convert) {
        Sk.abstr.checkArgsLen("_debug", arguments.length, 1, 2);
        if (convert !== undefined && Sk.ffi.isTrue(convert)) {
            console.log(Sk.ffi.remapToJs(value));
        } else {
            console.log(value);
        }
    });

    /*mod.game_div = new Sk.builtin.func(function () {
        if (Sk.divid !== undefined) {
            return new Sk.builtin.str(Sk.divid);
        } else {
            throw new Sk.builtin.AttributeError(
                "There is no value set for 'divid'.",
            );
        }
    });

    mod.setup = new Sk.builtin.func(function setup() {
        Sk.abstr.checkArgsLen("setup", arguments.length, 0, 0);
        if (Sk?.gameInterface?.runner !== undefined) {
            Sk.gameInterface.runner.showLoadPrompt = false;
            Sk.gameInterface.runner.forceUpdate();
        }
    });*/

    mod.set_hook = new Sk.builtin.func(function set_hook(name, hook) {
        Sk.abstr.checkArgsLen("set_hook", arguments.length, 2, 2);
        Sk.gameInterface.hooks[Sk.ffi.toJsString(name)] =
            Sk.gameInterface.wrapPyFunc(hook);
    });

    mod.set_value = new Sk.builtin.func(function set_value(
        name,
        value,
        use_state,
        callback,
    ) {
        Sk.abstr.checkArgsLen("set_value", arguments.length, 2, 4);
        if (use_state !== undefined && Sk.ffi.isTrue(use_state)) {
            Sk.gameInterface.runner.state[Sk.ffi.toJsString(name)] =
                Sk.ffi.remapToJs(value);
            Sk.gameInterface.runner.setState(Sk.gameInterface.runner.state);
        } else {
            Sk.gameInterface.runner.context.setValue(
                Sk.ffi.toJsString(name),
                Sk.ffi.remapToJs(value),
                callback ? Sk.gameInterface.wrapPyFunc(callback) : callback,
            );
        }
    });

    mod.get_value = new Sk.builtin.func(function get_value(name, use_state) {
        Sk.abstr.checkArgsLen("set_value", arguments.length, 1, 2);
        if (use_state !== undefined && Sk.ffi.isTrue(use_state)) {
            return Sk.ffi.remapToPy(
                Sk.gameInterface.runner.state[Sk.ffi.toJsString(name)],
            );
        } else {
            return Sk.ffi.remapToPy(
                Sk.gameInterface.runner.context.getValue(
                    Sk.ffi.toJsString(name),
                ),
            );
        }
    });

    return mod;
};
