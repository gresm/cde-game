import * as fs from "fs"
import * as pathlib from "path"

const metadataFilePath = "stories.json.js"

export class StoriesLoader {
    metadata
    cache
    loaded

    constructor() {
        this.loaded = false
        this.refresh()
    }

    loadMetadata() {
        return new Promise((resolve, reject) => {
            fs.readFile(getPath(metadataFilePath), (err, data) => {
                if (err) reject(err)
                resolve(JSON.parse(data.toString()))
            })
        })
    }

    forceLoadStory(name) {
        return new Promise((resolve, reject) => {
            if (!(name in this.metadata)) {
                reject(`Couldn't find ${name} in metadata.`)
            }
            else {
                fs.readFile(getPath(`stories/${name}`), (err, data) => {
                    if (err) reject(err)
                    resolve(data.toString())
                })
            }
        })
    }

    refresh() {
        this.cache = {}
        this.loaded = false
        this.loadMetadata().then((value) => {
            this.metadata = value
            this.loaded = true
        })
    }

    collectStoryNames() {
        var ret = Array()
        Object.keys(this.metadata).forEach(element => {
            if ("visible" in this.metadata && this.metadata[element].visible) ret.push(this.metadata[element].file)
        });
        return ret;
    }

    getStory(name) {
        return new Promise((resolve) => {
            if (name in this.cache) {
                resolve(this.cache[name])
            }
            else {
                forceLoadStory(name).then((value) => {
                    this.cache[name] = value
                    resolve(value)
                })
            }
        })
    }
}

var metadata = {}
var cache = {}
let globalLoader

function getPath(path) {
    console.log(pathlib.resolve(__dirname, path))
    return pathlib.resolve(__dirname, path)
}

function loadMetadata() {
    return new Promise((resolve, reject) => {
        fs.readFile(getPath(metadataFilePath), (err, data) => {
            if (err) reject(err)
            resolve(JSON.parse(data.toString()))
        })
    })
}

export function init() {
    loadMetadata().then((value) => {
        metadata = value
    })
    cache = {}
}

export function collectStoryNames() {
    var ret = Array()
    Object.keys(metadata).forEach(element => {
        if ("visible" in metadata && metadata[element].visible) ret.push(metadata[element].file)
    });
    return ret;
}

function forceLoadStory(name) {
    return new Promise((resolve, reject) => {
        if (!(name in metadata)) {
            reject(`Couldn't find ${name} in metadata.`)
        }
        else {
            fs.readFile(getPath(`/stories/${name}`), (err, data) => {
                if (err) reject(err)
                resolve(data.toString())
            })
        }
    })
}

export function getStory(name) {
    return new Promise((resolve) => {
        if (name in cache) {
            resolve(cache[name])
        }
        else {
            forceLoadStory(name).then((value) => {
                cache[name] = value
                resolve(value)
            })
        }
    })
}

export function getLoader() {
    if (globalLoader === undefined) {
        globalLoader = new StoriesLoader()
    }
    return globalLoader
}