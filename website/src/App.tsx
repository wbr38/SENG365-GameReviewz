import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import Game from "./components/Game";
import Games from "./components/Games";
import Home from "./components/Home";
import Navbar from "./components/NavBar";
import NotFound from "./components/NotFound";

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