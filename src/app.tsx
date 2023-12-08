import { LoggerService } from "@navikt/bidrag-ui-common";
import { Alert, BodyShort, Button, Heading, Loader } from "@navikt/ds-react";
import { QueryClient, QueryClientProvider, useQueryErrorResetBoundary } from "@tanstack/react-query";
import React, { lazy, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { BrowserRouter, Route, Routes, useParams } from "react-router-dom";

import { initMockData } from "./__mocks__/mocksForMissingEndpoints/mockData";
import { ForskuddHeader } from "./components/header/ForskuddHeader";
import { ErrorModal } from "./components/modal/ErrorModal";
import { ForskuddProvider } from "./context/ForskuddContext";
import { usePrefetchBehandlingAndGrunnlagspakke } from "./hooks/useApiData";
import { ForskuddPage } from "./pages/forskudd/ForskuddPage";
const NotatPage = lazy(() => import("./pages/notat/NotatPage"));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
        },
    },
});

initMockData();
export default function App() {
    const { reset } = useQueryErrorResetBoundary();
    return (
        <QueryClientProvider client={queryClient}>
            <ErrorBoundary
                onReset={reset}
                onError={(error, compStack) => {
                    LoggerService.error(
                        `Det skjedde en feil i bidrag-behandling skjermbildet ${error.message} - ${compStack.componentStack}`,
                        error
                    );
                }}
                fallbackRender={({ error, resetErrorBoundary }) => (
                    <Alert variant="error" className="w-8/12 m-auto mt-8">
                        <div>
                            <Heading spacing size="small" level="3">
                                Det har skjedd en feil
                            </Heading>
                            <BodyShort size="small">Feilmelding: {error.message}</BodyShort>
                            <Button size="small" className="w-max mt-4" onClick={() => resetErrorBoundary()}>
                                Last på nytt
                            </Button>
                        </div>
                    </Alert>
                )}
            >
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
                        <Route path="/forskudd/:behandlingId">
                            <Route index element={<ForskudWrapper />} />
                            <Route path="notat" element={<NotatPageWrapper />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </ErrorBoundary>
        </QueryClientProvider>
    );
}

function ForskudWrapper() {
    const { behandlingId } = useParams<{ behandlingId?: string }>();
    usePrefetchBehandlingAndGrunnlagspakke(Number(behandlingId));

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
    const { behandlingId } = useParams<{ behandlingId?: string }>();
    return (
        <Suspense
            fallback={
                <div className="flex justify-center">
                    <Loader size="3xlarge" title="venter..." variant="interaction" />
                </div>
            }
        >
            <NotatPage behandlingId={Number(behandlingId)} />
        </Suspense>
    );
};
