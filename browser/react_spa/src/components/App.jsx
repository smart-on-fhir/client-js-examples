import React                    from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import Launcher                 from "./Launcher.jsx";
import Home                     from "./Home";


export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/client-js-examples/react_spa/app" Component={Home} />
                <Route path="/client-js-examples/react_spa/" Component={Launcher} />
            </Routes>
        </BrowserRouter>
    );
}