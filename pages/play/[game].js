import { readdir } from "fs/promises"
import { getLoader } from "../../stories/server"
import { Game } from "../../components/game"

/**
 * @typedef { import("next").NextApiRequest } NextApiRequest
 * @typedef { import("next").NextApiResponse } NextApiResponse
 * @typedef { import("next").GetServerSidePropsContext } GetServerSidePropsContext
 */

export default function PlayGame({ story, name, code, curdir }) {
    console.log(curdir)
    return <Game story={story} name={name} code={code} />
}

var code = null

/**
 * 
 * @param { GetServerSidePropsContext } ctx 
 * @returns 
 */
export async function getServerSideProps(ctx) {
    readdir(".").then((value) => {
        console.log(value)
    })

    if (code === null) {
        code = "print('debug')" // await (await readFile("./game/main.py")).toString()
    }
    var curdir = await readdir(".")
    return {
        props: {
            story: getLoader().getStory(ctx.query.game), name: ctx.query.game, code: code,
            curdir: curdir
        }
    }
}