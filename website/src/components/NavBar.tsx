import SearchIcon from "@mui/icons-material/Search";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth-store";
import * as S from "../styles/NavBar.styles";

export default function NavBar() {

    const navigate = useNavigate();
    const authState = useAuthStore((state) => state.auth);
    const isLoggedIn = authState.token !== null && authState.userId !== null;

    const [searchText, setSearchText] = useState("");
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
    const SEARCH_DEBOUNCE_MS = 300;
    useEffect(() => {

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
                    <S.Title to="/">
                        Game Reviewz
                    </S.Title>

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

                    <S.Search>
                        <S.IconWrapper>
                            <SearchIcon />
                        </S.IconWrapper>
                        <S.StyledInputBase
                            placeholder="Search"
                            onChange={(event) => setSearchText(event.target.value)}
                        />
                    </S.Search>

                </Toolbar>
            </Container>
        </AppBar>
    );
}