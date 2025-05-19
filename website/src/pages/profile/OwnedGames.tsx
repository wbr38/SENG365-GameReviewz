import { GamesList } from "../Games";

export default function OwnedGames() {

    return (
        <div style={{
            margin: "0 auto"
        }}>
            <h1>Owned Games</h1>
            <GamesList
                ownedByMe={true}
            />
        </div>
    );
}