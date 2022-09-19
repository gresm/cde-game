import { getLoader } from "../../stories/server"
import { Game } from "../../components/game"
import { useRouter } from "next/router"

export default function PlayGame({ props }) {
    var router = useRouter()
    var story = getLoader().getStory(router.query.game)

    if (story === undefined) {
        return "Error"
    } else {
        return <Game />
    }
}

export function getServerSideProps({ req, res }) {
    return {
        props: {}
    }
}