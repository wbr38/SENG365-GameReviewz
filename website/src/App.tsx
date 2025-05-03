import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import Game from "./components/Game";
import Games from "./components/Games";
import Home from "./components/Home";
import NotFound from "./components/NotFound";

export default function App() {
    return (
        <div className="App">
            <Router>
                <Routes>
                    <Route path="*" element={<NotFound />} />
                    <Route path="/" element={<Home />} />
                    <Route path="/games" element={<Games />} />
                    <Route path="/games/:id" element={<Game />} />
                </Routes>
            </Router>
        </div>
    );
}