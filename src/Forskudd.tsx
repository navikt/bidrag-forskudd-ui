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

initMockData();
export default function Forskudd() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    <Route path="/forskudd/:behandlingId" element={<ForskudWrapper />} />
                    <Route path="/forskudd/:saksnummer/notat" element={<NotatPageWrapper />} />
                    <Route path="/" element={<div>Hello world</div>} />
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    );
}

function ForskudWrapper() {
    const { behandlingId } = useParams<{ behandlingId?: string }>();

    return (
        <>
            <ForskuddProvider behandlingId={Number(behandlingId)}>
                <ForskuddHeader />
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
