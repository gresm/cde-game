// Based and hevily modified on: https://stackoverflow.com/a/15292582/15140144
// This is shared under CC BY-SA 3.0 license
export function loadScriptsInQueue(scripts, callback) {
    callback = callback || function () { }
    var x = 0;
    var loopArray = function (scripts) {
        // call itself
        loadScript(scripts[x], function (_script) {
            callback(_script)
            // set x to next item
            x++;
            // any more items in array?
            if (x < scripts.length) {
                loopArray(scripts);
            }
        });
    }
    loopArray(_scripts, scripts);
}

export function loadScripts(scripts, callback) {
    callback = callback || function () { }

    for (var i = 0; i < scripts.length; i++) {
        loadScript(scripts[i], callback);
    }
}

function loadScript(src, callback) {
    script = document.createElement('script');

    script.onerror = function () {
        alert('Error to handle')
    }

    script.onload = function () {
        console.log(src + ' loaded ')
        callback(script);
    }

    script.src = src;
    document.getElementsByTagName('head')[0].appendChild(script);
}
// End of the snippet from: https://stackoverflow.com/a/15292582/15140144