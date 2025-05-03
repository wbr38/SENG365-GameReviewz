import { useParams } from "react-router-dom";

export default function Game() {
    const { id } = useParams();
    return (
        <h1>Game: #{id}</h1>
    );
}
