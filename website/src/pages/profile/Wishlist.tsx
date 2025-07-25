import { GamesList } from "../../components/GamesList";

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