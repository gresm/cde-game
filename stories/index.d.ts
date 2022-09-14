import * as fs from "fs"

declare const metadataFilePath = "/stories.json"

export interface MetadataEntry {
    visible?: Boolean
    file: string
}

export interface MetadataStructure {
    [propName: string]: MetadataEntry
}

export class StoriesLoader {
    metadata: MetadataStructure
    cache: Record<string, string>
    loaded: boolean

    constructor()

    private loadMetadata() : Promise<MetadataStructure>

    private forceLoadStory(name: string) : Promise<String>

    public refresh()

    public collectStoryNames() : Array<string>

    public getStory(name: string) : Promise<string>
}

declare var metadata: MetadataStructure
declare var cache: Record<string, string>
declare let globalLoader: StoriesLoader

declare function loadMetadata(): Promise<MetadataStructure>
declare function getPath(path: string) : string

export function init()

export function collectStoryNames() : Array<string>

declare function forceLoadStory(name: string) : Promise<string>

export function getStory(name: string) : Promise<string>

export function getLoader() : StoriesLoader