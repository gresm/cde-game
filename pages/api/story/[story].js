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
    res.status(200).json(loader.getStory(req.query.story))
}