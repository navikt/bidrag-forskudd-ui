import { BidragContainer } from "@navikt/bidrag-ui-common";
import { Loader } from "@navikt/ds-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FlagProvider, IConfig, useFlagsStatus } from "@unleash/proxy-client-react";
import React, { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes, useParams } from "react-router-dom";

import { ForskuddHeader } from "./components/header/ForskuddHeader";
import { ErrorModal } from "./components/modal/ErrorModal";
import text from "./constants/texts";
import { ForskuddProvider } from "./context/ForskuddContext";
import Brukerveiledning from "./docs/Brukerveiledning.mdx";
import { prefetchVisningsnavn } from "./hooks/useVisningsnavn";
import { ForskuddPage } from "./pages/forskudd/ForskuddPage";
import PageWrapper from "./pages/PageWrapper";
import { scrollToHash } from "./utils/window-utils";

const NotatPage = lazy(() => import("./pages/notat/NotatPage"));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 3,
            retryDelay: 2000,
        },
    },
});
const config: IConfig = {
    url: process.env.UNLEASH_API_URL as string,
    clientKey: process.env.UNLEASH_FRONTEND_TOKEN,
    refreshInterval: 15, // How often (in seconds) the client should poll the proxy for updates
    appName: "bidrag-behandling-ui",
};
export default function App() {
    // const { reset } = useQueryErrorResetBoundary();
    return (
        <FlagProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <Routes>
                        <Route path="/sak/:saksnummer/behandling/:behandlingId">
                            <Route index element={<ForskudWrapper />} />
                            <Route path="notat" element={<NotatPageWrapper />} />
                        </Route>
                        <Route path="/behandling/:behandlingId">
                            <Route index element={<ForskudWrapper />} />
                            <Route path="notat" element={<NotatPageWrapper />} />
                        </Route>
                        <Route path="/sak/:saksnummer/vedtak/:vedtakId">
                            <Route index element={<VedtakLesemodusWrapper />} />
                            <Route path="notat" element={<NotatPageWrapper />} />
                        </Route>
                        <Route path="/vedtak/:behandlingId">
                            <Route index element={<VedtakLesemodusWrapper />} />
                            <Route path="notat" element={<NotatPageWrapper />} />
                        </Route>
                        <Route path="/forskudd/brukerveiledning" element={<ForskuddBrukerveiledningPageWrapper />} />
                        <Route path="/forskudd/:behandlingId">
                            <Route index element={<ForskudWrapper />} />
                            <Route path="notat" element={<NotatPageWrapper />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </QueryClientProvider>
        </FlagProvider>
    );
}
function ForskuddBrukerveiledningPageWrapper() {
    useEffect(scrollToHash, []);
    return (
        <PageWrapper name="Forskudd brukerveiledning">
            <BidragContainer className="container p-6">
                <Brukerveiledning saksbehandlerNavn={""} />
            </BidragContainer>
        </PageWrapper>
    );
}
function VedtakLesemodusWrapper() {
    const { vedtakId } = useParams<{ vedtakId?: string }>();
    const { flagsReady, flagsError } = useFlagsStatus();

    prefetchVisningsnavn();
    if (!flagsReady && flagsError == false) {
        return (
            <div className="flex justify-center">
                <Loader size="3xlarge" title={text.loading} variant="interaction" />
            </div>
        );
    }
    return (
        <>
            <ForskuddProvider vedtakId={Number(vedtakId)}>
                <ForskuddHeader />
                <ForskuddPage />
                <ErrorModal />
            </ForskuddProvider>
        </>
    );
}
function ForskudWrapper() {
    const { behandlingId } = useParams<{ behandlingId?: string }>();
    const { flagsReady, flagsError } = useFlagsStatus();

    prefetchVisningsnavn();
    if (!flagsReady && flagsError == false) {
        return (
            <div className="flex justify-center">
                <Loader size="3xlarge" title={text.loading} variant="interaction" />
            </div>
        );
    }
    return (
        <>
            <ForskuddProvider behandlingId={Number(behandlingId)}>
                <ForskuddHeader />
                <ForskuddPage />
                <ErrorModal />
            </ForskuddProvider>
        </>
    );
}

const NotatPageWrapper = () => {
    const { behandlingId, vedtakId } = useParams<{ behandlingId?: string; vedtakId?: string }>();
    return (
        <Suspense
            fallback={
                <div className="flex justify-center">
                    <Loader size="3xlarge" title={text.loading} variant="interaction" />
                </div>
            }
        >
            <NotatPage behandlingId={Number(behandlingId)} vedtakId={Number(vedtakId)} />
        </Suspense>
    );
};
