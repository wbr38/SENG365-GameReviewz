import SearchIcon from '@mui/icons-material/Search';
import { InputBase } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";
import "../styles/NavBar.scss";

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
                    <Typography
                        variant="h6"
                        id="title"
                        component={Link}
                        to="/"
                    >
                        Game Reviewz
                    </Typography>

                    {/* Links */}
                    <Box sx={{ display: "flex" }}>
                        {navLinks.map((navLink) => (
                            <Button
                                key={navLink.name}
                                className="link"
                                component={Link}
                                to={navLink.link}
                            >
                                {navLink.name}
                            </Button>
                        ))}
                    </Box>

                    {/* Search */}
                    <div className="search">
                        <div id="icon">
                            <SearchIcon />
                        </div>
                        <InputBase
                            placeholder="Search"
                            id="input"
                            onKeyDown={handleSearch}
                        />
                    </div>

                </Toolbar>
            </Container>
        </AppBar>
    );
}