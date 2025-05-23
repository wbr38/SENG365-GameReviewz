import AccountBoxIcon from '@mui/icons-material/AccountBox';
import LoginIcon from '@mui/icons-material/Login';
import RegisterIcon from '@mui/icons-material/NoteAlt';
import RateReviewIcon from "@mui/icons-material/RateReview";
import RedeemIcon from "@mui/icons-material/Redeem";
import SourceIcon from "@mui/icons-material/Source";
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import { Button, ButtonOwnProps } from "@mui/material";
import { JSX } from "react";
import { useNavigate } from "react-router-dom";
import GameSearch from "../components/GameSearch";
import { useAuthStore } from "../store/auth-store";

export default function Home() {
    const navigate = useNavigate();

    const authState = useAuthStore((state) => state.auth);
    const isLoggedIn = authState.token !== null && authState.userId !== null;

    const links: {
        name: string,
        link: string,
        icon: JSX.Element,
        color?: ButtonOwnProps["color"]
    }[] = [
            { name: "All Games", link: "./games", icon: <VideogameAssetIcon /> },
        ];

    if (!isLoggedIn) {
        links.push({ name: "Login", link: "./login", icon: <LoginIcon /> });
        links.push({ name: "Register", link: "./register", icon: <RegisterIcon /> });
    } else {
            links.push({ name: "Profile", link: "./profile", icon: <AccountBoxIcon />, color: "primary" });
            links.push({ name: "Wishlist", link: "/profile/wishlist", icon: <RedeemIcon />, color: "secondary" });
            links.push({ name: "Owned Games", link: "/profile/owned-games", icon: <VideogameAssetIcon />, color: "secondary" });
            links.push({ name: "Reviewed Games", link: "/profile/reviewed-games", icon: <RateReviewIcon />, color: "secondary" });
            links.push({ name: "Created Games", link: "/profile/created-games", icon: <SourceIcon />, color: "secondary" });
    }

    return (
        <div>
            <h1>Welcome</h1>

            <div style={{
                display: "flex",
                width: "70vw",
                margin: "auto",
                flexWrap: "wrap",
                gap: "1em",
                justifyContent: "center"
            }}>
                {links.map(link => (
                    <Button
                        key={link.name}
                        variant="outlined"
                        color={link.color ?? "primary"}
                        onClick={() => navigate(link.link)}
                        startIcon={link.icon}
                    >
                        {link.name}
                    </Button>
                ))}

            </div>

            <GameSearch
                debounceMs={-1}
                style={{
                    margin: "3em auto",
                    maxWidth: "50vw"
                }} />
        </div>
    );
}