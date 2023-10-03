import { getLoader } from "../../stories/server";
import { Game } from "../../components/game";
import { Component } from "react";

/**
 * @typedef { import("next").NextApiRequest } NextApiRequest
 * @typedef { import("next").NextApiResponse } NextApiResponse
 * @typedef { import("next").GetServerSidePropsContext } GetServerSidePropsContext
 */

export default class PlayGame extends Component {
    constructor(props) {
        super(props);
        var { story, name } = props;
        this.story = story;
        this.name = name;
    }

    render() {
        return <Game story={this.story} name={this.name} />;
    }
}

/**
 *
 * @param { GetServerSidePropsContext } ctx
 * @returns
 */
export async function getServerSideProps(ctx) {
    return {
        props: {
            story: getLoader().getStory(ctx.query.game),
            name: ctx.query.game,
        },
    };
}
