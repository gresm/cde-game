var $builtinmodule = function (name) {
    var mod = {};

    mod.__name__ = new Sk.builtin.str("game_interface");

    mod.get_story = new Sk.builtin.func(function get_story() {
        Sk.builtin.pyCheckArgsLen("get_story", arguments.length, 0, 0);
        return Sk.ffi.remapToPy(Sk.gameInterface.story);
    });

    mod.game_div = new Sk.builtin.func(function () {
        if (Sk.divid !== undefined) {
            return new Sk.builtin.str(Sk.divid);
        } else {
            throw new Sk.builtin.AttributeError(
                "There is no value set for 'divid'.",
            );
        }
    });

    mod.out = new Sk.builtin.func(function out(text) {
        Sk.builtin.pyCheckArgsLen("out", arguments.length, 1, 1);
        if (Sk.gameInterface.out !== undefined) {
            Sk.gameInterface.out(Sk.ffi.remapToJs(text));
        } else {
            throw new Sk.builtin.AttributeError(
                "There is no 'out' callback defined by javascript.",
            );
        }
    });

    mod.err = new Sk.builtin.func(function err(text) {
        Sk.builtin.pyCheckArgsLen("err", arguments.length, 1, 1);
        if (Sk.gameInterface.err !== undefined) {
            Sk.gameInterface.err(sk.ffi.remaptoJs(text));
        } else {
            throw new Sk.builtin.AttributeError(
                "There is no 'err' callback defined by javascript.",
            );
        }
    });

    // function dflbrowser($gbl, $loc) {
    //     $loc.__init__ = new Sk.builtin.func(function __init__(self) {
    //         return Sk.builtin.none.none$;
    //     });

    //     $loc.open = new Sk.builtin.func(function open(self, url) {
    //         Sk.builtin.pyCheckArgsLen("open", arguments.length, 2, 4);
    //         return open_tab(url);
    //     });

    //     $loc.open_new = new Sk.builtin.func(function open_new(self, url) {
    //         Sk.builtin.pyCheckArgsLen("open_new", arguments.length, 2, 2);
    //         return open_tab(url);
    //     });

    //     $loc.open_new_tab = new Sk.builtin.func(function open_new_tab(self, url) {
    //         Sk.builtin.pyCheckArgsLen("open_new_tab", arguments.length, 2, 2);
    //         return open_tab(url);
    //     });
    // }

    // mod.DefaultBrowser = Sk.misceval.buildClass(mod, dflbrowser, "DefaultBrowser", []);

    return mod;
};
