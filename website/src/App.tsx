import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import Game from "./pages/Game";
import Games from "./pages/Games";
import Home from "./pages/Home";
import Navbar from "./components/NavBar";
import NotFound from "./pages/NotFound";

const darkTheme = createTheme({
    palette: {
        mode: "dark"
    }
});

export default function App() {
    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />

            <div className="App">
                <Router>
                    <Navbar />
                    <div style={{ padding: "2em" }}>
                        <Routes>
                            <Route path="*" element={<NotFound />} />
                            <Route path="/" element={<Home />} />
                            <Route path="/games" element={<Games />} />
                            <Route path="/games/:id" element={<Game />} />
                        </Routes>
                    </div>
                </Router>
            </div>
        </ThemeProvider>
    );
}