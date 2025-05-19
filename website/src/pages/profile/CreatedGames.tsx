import { useAuthStore } from "../../store/auth-store";
import { GamesList } from "../Games";

export default function CreatedGames() {
    const authState = useAuthStore((state) => state.auth);
    const userId = authState.userId ?? undefined;
    return (
        <div style={{
            margin: "0 auto"
        }}>

            <h1>Created Games</h1>
            <GamesList
                creatorId={userId}
            />
        </div>
    )
}