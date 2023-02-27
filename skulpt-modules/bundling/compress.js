var { readFile, readdir } = require("fs/promises");
var minify = require("@node-minify/core");
var uglifyJS = require("@node-minify/uglify-js");

const path = require("path");

/**
 * 
 * @param {string} code Code to minify
 * @returns {Promise<string>} Minified code
 */
async function uglifyCode(code) {
    return await minify({
        compressor: uglifyJS,
        content: code,
        options: {
            warnings: true,
            mangle: false,
        }
    });
};

/**
 * 
 * @param {import("fs").PathLike} dir Path to a directory
 * @returns { Promise<{[name: string]: string}> }
 */
 async function bundleDirectory(dir) {
    var dirs = await readdir(dir)
    var ret = {}
    for (idx in dirs) {
        var file = dirs[idx]
        if (!(file.endsWith(".js") || file.endsWith(".py"))) {
            continue
        }
        
        var code = (await readFile(path.join(dir, file))).toString()
        if (code === "") {
            ret["./" + file] = code
            continue
        }

        if (file.endsWith(".py")) {
            ret["./" + file] = code
            continue
        }

        ret["./" + file] = await uglifyCode(code)
    }

    return ret;
 }


bundleDirectory("./skulpt-modules").then((v) => {
    console.log(`// This file was automatically generated. Don't change it.
export default JSON.parse(String.raw\`${JSON.stringify(v)}\`)`)
})