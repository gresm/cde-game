import { data } from "./stories_json"

export interface StoriesData {
    index: {[name: string]: string}
    stories: {[name: string]: string}
}

export class StoriesMenager {
    data: StoriesData
    indexes: string[]
    stories: {[name: string]: string}

    constructor(data: StoriesData)

    public collectStoryNames() : {[name: string]: string}

    public getStory(name: string) : string

    public storyExists(name: string) : boolean
}

declare let defaultMenager: StoriesMenager

export function getLoader() : StoriesMenager