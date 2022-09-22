import { getLoader } from "../../stories/server"
import { Game } from "../../components/game"

/**
 * @typedef { import("next").NextApiRequest } NextApiRequest
 * @typedef { import("next").NextApiResponse } NextApiResponse
 * @typedef { import("next").GetServerSidePropsContext } GetServerSidePropsContext
 */

export default function PlayGame({ story, name }) {
    return <Game story={story} name={name} />
}

/**
 * 
 * @param { GetServerSidePropsContext } ctx 
 * @returns 
 */
export function getServerSideProps(ctx) {
    return {
        props: {story: getLoader().getStory(ctx.query.game), name: ctx.query.game},
    }
}