import { useSearchParams } from "react-router-dom";
import { GamesList } from "../components/GamesList";

export default function Games() {
    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get("search") ?? undefined;
    return (
        <div>
            <GamesList
                search={search}
            />
        </div>
    )
};