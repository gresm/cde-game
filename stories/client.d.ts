declare const apiRoute
declare const listStoriesRoute 
declare const getStoryRoute

export function listStories() : Promise<object>

export function getStory(name: string) : Promise<object>