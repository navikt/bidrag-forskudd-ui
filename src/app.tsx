import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, useParams } from "react-router-dom";

import { initMock } from "./__mocks__/msw";
import ForskuddPage from "./pages/forskudd/ForskuddPage";

// This file is only used for development. The entrypoint is under pages folder
initMock();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/:personId/:saksnummer" element={<ForskudWrapper />} />
                <Route path="/" element={<div>Hello world</div>} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);

function ForskudWrapper() {
    const { personId, saksnummer } = useParams<{ personId?: string; saksnummer?: string }>();
    return <ForskuddPage personId={personId} saksnummer={saksnummer} />;
}
