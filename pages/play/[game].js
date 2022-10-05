import { readFile } from "fs/promises"
import { getLoader } from "../../stories/server"
import { Game } from "../../components/game"

/**
 * @typedef { import("next").NextApiRequest } NextApiRequest
 * @typedef { import("next").NextApiResponse } NextApiResponse
 * @typedef { import("next").GetServerSidePropsContext } GetServerSidePropsContext
 */

export default function PlayGame({ story, name, code }) {
    return <Game story={story} name={name} code={code} />
}

var code = null

/**
 * 
 * @param { GetServerSidePropsContext } ctx 
 * @returns 
 */
export async function getServerSideProps(ctx) {
    if (code === null) {
        code = await (await readFile("./game/main.py")).toString()
    }
    return {
        props: { story: getLoader().getStory(ctx.query.game), name: ctx.query.game, code: code}
    }
}