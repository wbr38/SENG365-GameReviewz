import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div>
            <h1>Home Page</h1>
            <Link to={"/games"}>Games List</Link>
            <br></br>
            <Link to={"/games/1"}>Game #1</Link>
        </div>
    );
}