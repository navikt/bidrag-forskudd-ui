import { LoggerService } from "@navikt/bidrag-ui-common";
import { Alert, BodyShort, Button, Heading, Loader } from "@navikt/ds-react";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

export const QueryErrorWrapper = ({ children }) => {
    return (
        <QueryErrorResetBoundary>
            {({ reset }) => (
                <ErrorBoundary
                    onError={(error, compStack) => {
                        LoggerService.error(
                            `Det skjedde en feil i bidrag-behandling skjermbildet ${error.message} - ${compStack.componentStack}`,
                            error
                        );
                    }}
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
