import SearchIcon from '@mui/icons-material/Search';
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import { Link } from "react-router-dom";
import * as S from './NavBar.styles';

const navLinks: { name: string, link: string }[] = [
    { name: "Log In", link: "/login" },
    { name: "Register", link: "/register" },
    { name: "Games", link: "/games" },
]

function handleSearch(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter')
        return;

    const query = event.currentTarget.value;

    // TODO
    console.log("Search for: ", query);
}

export default function NavBar() {
    return (
        <AppBar position="static" className="nav">
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