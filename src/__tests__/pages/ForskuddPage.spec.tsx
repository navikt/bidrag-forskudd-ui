import { render } from "@testing-library/react";
import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect } from "chai";
import { describe } from "mocha";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter } from "react-router-dom";

import { BehandlingType, SoknadFraType, SoknadType } from "../../api/BidragBehandlingApi";
import { ForskuddHeader } from "../../components/header/ForskuddHeader";
import { ForskuddProvider } from "../../context/ForskuddContext";
import { ForskuddPage } from "../../pages/forskudd/ForskuddPage";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            suspense: true,
        },
    },
});
const renderWithRouter = (ui, { route = "/" } = {}) => {
    window.history.pushState({}, "Test page", route);

    return {
        user: userEvent.setup(),
        ...render(ui, { wrapper: BrowserRouter }),
    };
};

describe("ForskuddPage", () => {
    it("should render", async () => {
        const behandlingApi = {
            api: {
                hentBehandling: () =>
                    new Promise((res) => {
                        res({
                            data: {
                                id: 1234,
                                behandlingType: BehandlingType.FORSKUDD,
                                soknadType: SoknadType.SOKNAD,
                                datoFom: "2021-02-02",
                                datoTom: "2021-02-02",
                                mottatDato: "2021-02-02",
                                soknadFraType: SoknadFraType.BM,
                                saksnummer: "1234",
                                behandlerEnhet: "1234",
                                roller: [],
                            },
                        });
                    }),
            },
        };

        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <ForskuddProvider behandlingId={Number(1)} behandlingApi={behandlingApi}>
                    <ForskuddHeader />
                    <ForskuddPage />
                </ForskuddProvider>
            </QueryClientProvider>,
            { route: "/forskudd/1234?steg=virkningstidspunkt" }
        );

        await waitFor(() => {
            const activeStepButton = document.querySelector(".navds-stepper__step--active");
            expect(activeStepButton.innerHTML).includes("Virkningstidspunkt");
        });
    });
});
