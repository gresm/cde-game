import { data } from "./stories_json"

export interface StoriesData {
    index: string[]
    stories: {[name: string]: string}
}

export class StoriesMenager {
    data: StoriesData
    indexes: string[]
    stories: {[name: string]: string}

    constructor(data: StoriesData)

    public collectStoryNames() : string[]

    public getStory(name: string) : string
}

declare let defaultMenager: StoriesMenager

export function getLoader() : StoriesMenager