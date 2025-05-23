import { styled } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth-store";
import GameSearch from "./GameSearch";

export const Title = styled(Link)(({ theme }) => ({
    ...theme.typography.h6,
    color: "inherit",
    display: "flex",
    fontFamily: "monospace",
    fontWeight: "700",
    letterSpacing: "0.1rem",
    marginRight: "auto",
    textDecoration: "none",
}));

export default function NavBar() {

    const navigate = useNavigate();
    const authState = useAuthStore((state) => state.auth);
    const isLoggedIn = authState.token !== null && authState.userId !== null;

    const [searchText, setSearchText] = useState<string | null>(null);
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
    const SEARCH_DEBOUNCE_MS = 300;

    useEffect(() => {
        if (searchText == null)
            return;

        if (searchTimeout)
            clearTimeout(searchTimeout);

        const newTimeout = setTimeout(() => {
            navigate(`/games?search=${encodeURIComponent(searchText)}`);
        }, SEARCH_DEBOUNCE_MS);
        setSearchTimeout(newTimeout);

    }, [searchText]);

    const navLinks: { name: string, link: string }[] = [
        { name: "Games", link: "/games" },
    ]

    if (!isLoggedIn) {
        navLinks.push(
            { name: "Log In", link: "/login" },
            { name: "Register", link: "/register" },
        );
    } else {
        navLinks.push(
            { name: "Profile", link: "/profile" },
            { name: "Log Out", link: "/logout" },
        );
    }

    return (
        <AppBar position="sticky" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Container >
                <Toolbar disableGutters>
                    {/* Website Title */}
                    <Title to="/">
                        Game Reviewz
                    </Title>

                    {/* Links */}
                    <Box sx={{ display: "flex" }}>
                        {navLinks.map((navLink) => (
                            <Button
                                key={navLink.name}
                                component={Link}
                                to={navLink.link}
                                sx={{ my: 2, color: "white" }}
                            >
                                {navLink.name}
                            </Button>
                        ))}
                    </Box>

                    <GameSearch />
                </Toolbar>
            </Container>
        </AppBar>
    );
}