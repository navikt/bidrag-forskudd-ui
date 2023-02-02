import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, useParams } from "react-router-dom";

import { initMock } from "./__mocks__/msw";
import App from "./pages/App";

// This file is only used for development. The entrypoint is under pages folder
initMock();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/:personId" element={<AppWrapper />} />
                <Route path="/" element={<div>Hello world</div>} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);

function AppWrapper() {
    const { personId } = useParams();
    return <App personId={personId} />;
}
