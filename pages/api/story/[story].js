import { getLoader } from "../../../stories/server"

var loader = getLoader()

/**
 * @typedef { import("next").NextApiRequest } NextApiRequest
 * @typedef { import("next").NextApiResponse } NextApiResponse
 */


/**
 * 
 * @param { NextApiRequest } req 
 * @param { NextApiResponse } res 
 */
export default function listStories(req, res) {
    var story = loader.getStory(req.query.story)
    if (story !== undefined) {
        res.status(200).json(story)
    } else {
        res.status(404).json({"error": "not found", "name": req.query.story})
    }
}