import { Loader } from "@navikt/ds-react";
import React, { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter, Route, Routes, useParams } from "react-router-dom";

import { initMockData } from "./__mocks__/mocksForMissingEndpoints/mockData";
import { ForskuddHeader } from "./components/header/ForskuddHeader";
import { ForskuddProvider } from "./context/ForskuddContext";
import { ForskuddPage } from "./pages/forskudd/ForskuddPage";
const NotatPage = lazy(() => import("./pages/notat/NotatPage"));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            suspense: true,
        },
    },
});

// TODO: move initMock() to app.tsx once backend is ready
// initMock();
initMockData();
export default function Forskudd() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    <Route path="/forskudd/:saksnummer" element={<ForskudWrapper />} />
                    <Route path="/forskudd/:saksnummer/notat" element={<NotatPageWrapper />} />
                    <Route path="/" element={<div>Hello world</div>} />
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    );
}

function ForskudWrapper() {
    const { saksnummer } = useParams<{ saksnummer?: string }>();

    return (
        <>
            <ForskuddHeader behandlingId={Number(saksnummer)} />
            <ForskuddProvider saksnummer={saksnummer}>
                <ForskuddPage />
            </ForskuddProvider>
        </>
    );
}

const NotatPageWrapper = () => (
    <Suspense
        fallback={
            <div className="flex justify-center">
                <Loader size="3xlarge" title="venter..." />
            </div>
        }
    >
        <NotatPage />
    </Suspense>
);
