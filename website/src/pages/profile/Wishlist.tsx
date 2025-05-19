import { GamesList } from "../Games";

export default function Wishlist() {
    return (
        <div style={{
            margin: "0 auto"
        }}>
            <h1>Wishlist</h1>
            <GamesList
                wishlistedByMe={true}
            />
        </div>
    )
}