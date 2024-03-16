var loadedScripts = new Object();

// Based and hevily modified on: https://stackoverflow.com/a/15292582/15140144
// This is shared under CC BY-SA 3.0 license (Is MIT license valid?)
export function loadScriptsInQueue(scripts, callback) {
    callback = callback || [function () {}].fill(scripts.length);
    var x = 0;
    var loopArray = function (scripts) {
        // call itself
        loadScript(scripts[x], function (_script) {
            callback[x](_script);
            // set x to next item
            x++;
            // any more items in array?
            if (x < scripts.length) {
                loopArray(scripts);
            }
        });
    };
    loopArray(scripts);
}

export function loadScripts(scripts, callback) {
    callback = callback || [function () {}].fill(scripts.length);

    for (var i = 0; i < scripts.length; i++) {
        loadScript(scripts[i], callback[i]);
    }
}

export function loadScript(src, callback) {
    var script = document.createElement("script");
    loadedScripts[src] = false;

    script.onerror = function (err) {
        alert("Error to handle");
        throw err;
    };

    script.onload = function () {
        console.log(src + " loaded ");
        loadedScripts[src] = true;
        callback(script);
    };

    script.src = src;
    document.getElementsByTagName("head")[0].appendChild(script);
}
// End of the snippet from: https://stackoverflow.com/a/15292582/15140144

export function wasScriptLoaded(src) {
    if (doesScriptExist(src)) {
        return loadedScripts[src];
    }
    return false;
}

export function isScriptLoading(src) {
    if (doesScriptExist(src)) {
        return !loadedScripts[src];
    }
    return false;
}

export function doesScriptExist(src) {
    return Object.prototype.hasOwnProperty.bind(loadedScripts)(src);
}

function allScriptNodesFrom(src) {
    return document.head.querySelectorAll(`script[src="${src}]"`);
}

export function doseScriptNodeExist(src) {
    var ret = allScriptNodesFrom(src).length !== 0;
    console.log(ret);
    return ret;
}
