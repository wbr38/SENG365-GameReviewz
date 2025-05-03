import React from "react";
import logo from "./logo.svg";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import NotFound from "./components/NotFound";
import Games from "./components/Games";
import Home from "./components/Home";
import Game from "./components/Game";

function App() {
    return (
        <div className="App">
            <Router>
                <div>
                    <Routes>
                        <Route path="*" element={<NotFound />} />
                        <Route path="/" element={<Home />} />
                        <Route path="/games" element={<Games />} />
                        <Route path="/games/:id" element={<Game />} />
                    </Routes>
                </div>
            </Router>
        </div>
    );
}

export default App;
