import { render } from "@testing-library/react";
import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect } from "chai";
import { describe } from "mocha";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter } from "react-router-dom";

import { mockSak } from "../../__mocks__/sinon/MockDokumentService";
import { ForskuddProvider } from "../../context/ForskuddContext";
import { ForskuddPage } from "../../pages/forskudd/ForskuddPage";
import { sinonSandbox } from "../resources/mocha.init";

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
        mockSak(sinonSandbox);
        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <ForskuddProvider saksnummer="1234">
                    <ForskuddPage />
                </ForskuddProvider>
            </QueryClientProvider>,
            { route: "/1234?steg=virkningstidspunkt" }
        );
        await waitFor(() => {
            const activeStepButton = document.querySelector(".navds-stepper__step--active");
            expect(activeStepButton.innerHTML).includes("Virkningstidspunkt");
        });
    });
});
