import React                    from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import Launcher                 from "./Launcher.jsx";
import Home                     from "./Home";


export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/app" Component={Home} />
                <Route path="/" Component={Launcher} />
            </Routes>
        </BrowserRouter>
    );
}