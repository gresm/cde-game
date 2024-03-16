export interface StoriesData {
    index: { [name: string]: string };
    stories: { [name: string]: object };
}

export class StoriesManager {
    data: StoriesData;
    indexes: string[];
    stories: { [name: string]: object };

    constructor(data: StoriesData);

    public collectStoryNames(): { [name: string]: string };

    public getStory(name: string): object;

    public storyExists(name: string): boolean;
}

export function getLoader(): StoriesManager;
