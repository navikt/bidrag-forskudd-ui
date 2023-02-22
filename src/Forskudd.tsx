import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter, Route, Routes, useParams } from "react-router-dom";

import { initMock } from "./__mocks__/msw";
import { ForskuddProvider } from "./context/ForskuddContext";
import { ForskuddPage } from "./pages/forskudd/ForskuddPage";

const queryClient = new QueryClient();

// TODO: move initMock() to app.tsx once backend is ready
initMock();
export default function Forskudd() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/forskudd/:saksnummer" element={<ForskudWrapper />} />
                <Route path="/" element={<div>Hello world</div>} />
            </Routes>
        </BrowserRouter>
    );
}

function ForskudWrapper() {
    const { saksnummer } = useParams<{ saksnummer?: string }>();
    return (
        <QueryClientProvider client={queryClient}>
            <ForskuddProvider saksnummer={saksnummer}>
                <ForskuddPage />
            </ForskuddProvider>
        </QueryClientProvider>
    );
}
