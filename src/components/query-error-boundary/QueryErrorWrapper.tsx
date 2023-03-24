import { Alert, BodyShort, Button, Heading, Loader } from "@navikt/ds-react";
import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { QueryErrorResetBoundary } from "react-query";

export const QueryErrorWrapper = ({ children }) => {
    return (
        <QueryErrorResetBoundary>
            {({ reset }) => (
                <ErrorBoundary
                    fallbackRender={({ error, resetErrorBoundary }) => (
                        <Alert variant="error">
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
                    onReset={reset}
                >
                    <Suspense
                        fallback={
                            <div className="flex justify-center">
                                <Loader size="3xlarge" title="venter..." variant="interaction" />
                            </div>
                        }
                    >
                        {children}
                    </Suspense>
                </ErrorBoundary>
            )}
        </QueryErrorResetBoundary>
    );
};
