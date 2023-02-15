import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, useParams } from "react-router-dom";

import { initMock } from "./__mocks__/msw";
import { ForskuddProvider } from "./context/ForskuddContext";
import { ForskuddPage } from "./pages/forskudd/ForskuddPage";

// This file is only used for development. The entrypoint is under pages folder
initMock();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/:saksnummer" element={<ForskudWrapper />} />
                <Route path="/" element={<div>Hello world</div>} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);

function ForskudWrapper() {
    const { saksnummer } = useParams<{ saksnummer?: string }>();
    return (
        <ForskuddProvider saksnummer={saksnummer}>
            <ForskuddPage />
        </ForskuddProvider>
    );
}
