import AccountBoxIcon from "@mui/icons-material/AccountBox";
import PasswordIcon from "@mui/icons-material/Password";
import RateReviewIcon from "@mui/icons-material/RateReview";
import RedeemIcon from "@mui/icons-material/Redeem";
import SourceIcon from "@mui/icons-material/Source";
import VideogameAssetIcon from "@mui/icons-material/VideogameAsset";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import { useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth-store";

const drawerWidth = 235;

export default function Profile() {

    const navigate = useNavigate();
    const authState = useAuthStore((state) => state.auth);
    const isLoggedIn = authState.token !== null && authState.userId !== null;

    // Redirect if not logged in
    useEffect(() => {
        if (!isLoggedIn)
            navigate("/");
    }, []);

    const navLinks: {
        name: string,
        link: string,
        icon: any
    }[] = [
            { name: "Profile", link: "/profile", icon: <AccountBoxIcon /> },
            { name: "Change Password", link: "/profile/change-password", icon: <PasswordIcon /> },
            { name: "Wishlist", link: "/profile/wishlist", icon: <RedeemIcon /> },
            { name: "Owned Games", link: "/profile/owned-games", icon: <VideogameAssetIcon /> },
            { name: "Reviewed Games", link: "/profile/reviewed-games", icon: <RateReviewIcon /> },
            { name: "Created Games", link: "/profile/created-games", icon: <SourceIcon /> },
        ]

    return (
        <div style={{ display: "flex" }}>
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    "& .MuiDrawer-paper": {
                        width: drawerWidth,
                        boxSizing: "border-box"
                    },
                }}
            >
                <Toolbar />
                <Box>
                    <List>
                        {navLinks.map((navLink) => (
                            <ListItem
                                key={navLink.name}
                                disablePadding
                            >
                                <ListItemButton
                                    component={Link}
                                    to={navLink.link}
                                >
                                    <ListItemIcon>
                                        {navLink.icon}
                                    </ListItemIcon>
                                    <ListItemText primary={navLink.name} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>

            <Outlet />
        </div>
    );
}