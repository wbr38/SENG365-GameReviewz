import SearchIcon from '@mui/icons-material/Search';
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import { Link, useNavigate } from "react-router-dom";
import * as S from '../styles/NavBar.styles';
import { useAuthStore } from '../store/auth-store';

export default function NavBar() {

    const authState = useAuthStore((state) => state.auth);
    const loggedIn = authState.token !== null && authState.userId !== null;

    const navigate = useNavigate();
    function handleSearch(event: React.KeyboardEvent<HTMLInputElement>) {

        if (event.key !== 'Enter')
            return;

        const query = event.currentTarget.value;
        navigate(`/games?search=${encodeURIComponent(query)}`);
    }

    const navLinks: { name: string, link: string }[] = [
        { name: "Games", link: "/games" },
    ]

    if (!loggedIn) {
        navLinks.push(
            { name: "Log In", link: "/login" },
            { name: "Register", link: "/register" },
        );
    } else {
        navLinks.push(
            { name: "Log Out", link: "/logout" },
        );
    }

    return (
        <AppBar position="static">
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
                            onKeyDown={handleSearch}
                        />
                    </S.Search>

                </Toolbar>
            </Container>
        </AppBar>
    );
}