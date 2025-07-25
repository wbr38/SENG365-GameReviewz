import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import Navbar from "./components/NavBar";
import { SnackbarProvider } from "./components/SnackBar";
import Game from "./pages/Game";
import Games from "./pages/Games";
import Home from "./pages/Home";
import LogIn from "./pages/LogIn";
import LogOut from "./pages/LogOut";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";
import ChangePassword from "./pages/profile/ChangePassword";
import CreatedGames from "./pages/profile/CreatedGames";
import OwnedGames from "./pages/profile/OwnedGames";
import Profile from "./pages/profile/Profile";
import ProfileView from "./pages/profile/ProfileView";
import ReviewedGames from "./pages/profile/ReviewedGames";
import Wishlist from "./pages/profile/Wishlist";

const darkTheme = createTheme({
    palette: {
        mode: "dark"
    }
});

export default function App() {
    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />

            <SnackbarProvider>
                <div className="App">
                    <Router>
                        <Navbar />

                        <div style={{ padding: "2em" }}>
                            <Routes>
                                <Route path="*" element={<NotFound />} />
                                <Route path="/" element={<Home />} />
                                <Route path="/games" element={<Games />} />
                                <Route path="/games/:id" element={<Game />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/logout" element={<LogOut />} />
                                <Route path="/login" element={<LogIn />} />
                                <Route path="/profile" element={<Profile />}>
                                    <Route index element={<ProfileView />} />
                                    <Route path="change-password" element={<ChangePassword />} />
                                    <Route path="wishlist" element={<Wishlist />} />
                                    <Route path="owned-games" element={<OwnedGames />} />
                                    <Route path="reviewed-games" element={<ReviewedGames />} />
                                    <Route path="created-games" element={<CreatedGames />} />
                                </Route>
                            </Routes>
                        </div>
                    </Router>
                </div>
            </SnackbarProvider>
        </ThemeProvider>
    );
}