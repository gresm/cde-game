const apiRoute = "/api"
const listStoriesRoute = apiRoute + "/list-stories"
const getStoryRoute = apiRoute + "/story/"

export function listStories() {
    return fetch(listStoriesRoute).then((value) => {
        return value.json()
    })
}

export function getStory(name) {
    return fetch(getStoryRoute + name).then((value) => {
        return value.json()
    })
}