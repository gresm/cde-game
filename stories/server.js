import data from "../generated/stories-json";

export class StoriesManager {
    data;
    indexes;
    stories;

    constructor(data) {
        this.data = data;
        this.indexes = data.index;
        this.stories = data.stories;
    }

    collectStoryNames() {
        return this.indexes;
    }

    getStory(name) {
        if (name in this.stories) {
            return this.stories[name];
        }
        return null;
    }

    storyExists(name) {
        return name in this.stories;
    }
}

let defaultMenager;

export function getLoader() {
    if (typeof defaultMenager === "undefined") {
        defaultMenager = new StoriesManager(data);
    }
    return defaultMenager;
}
