// New https://github.com/skulpt/skulpt/blob/master/src/lib/document.js implementation, but no release with it avalible yet, so including it here.

function $builtinmodule() {
    const {
        builtin: { str: pyStr },
        misceval: { callsimArray: pyCall },
        ffi: { toPy },
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