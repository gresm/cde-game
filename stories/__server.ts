import { data } from "./stories_json"

export interface StoriesData {
    index: string[]
    stories: {[name: string]: string}
}

export class StoriesMenager {
    data: StoriesData
    indexes: string[]
    stories: {[name: string]: string}

    constructor(data: StoriesData) {
        this.data = data
        this.indexes = data.index
        this.stories = data.stories
    }

    public collectStoryNames() : string[] {
        return this.indexes
    }

    public getStory(name: string) : string {
        if (name in this.stories){
            return this.stories[name]
        }
        return ""
    }
}

let defaultMenager: StoriesMenager

export function getLoader() {
    if (typeof defaultMenager === "undefined") {
        defaultMenager = new StoriesMenager(data)
    }
    return defaultMenager
}