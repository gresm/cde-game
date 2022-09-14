import { data } from "./stories_json"

export class StoriesMenager {
    data
    indexes
    stories

    constructor(data) {
        this.data = data
        this.indexes = data.index
        this.stories = data.stories
    }

    collectStoryNames() {
        return this.indexes
    }

    getStory(name) {
        if (name in this.stories){
            return this.stories[name]
        }
        return undefined
    }
}

let defaultMenager

export function getLoader() {
    if (typeof defaultMenager === "undefined") {
        defaultMenager = new StoriesMenager(data)
    }
    return defaultMenager
}