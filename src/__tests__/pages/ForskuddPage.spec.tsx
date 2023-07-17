import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect } from "chai";
import { describe } from "mocha";
import { rest } from "msw";
import { setupServer } from "msw/node";
import origFetch from "node-fetch";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import sinon from "sinon";

import { behandlingMockApiData } from "../../__mocks__/testdata/behandlingTestData";
import { boforholdData } from "../../__mocks__/testdata/boforholdTestData";
import { virkningstidspunktTestData } from "../../__mocks__/testdata/virkningstidspunktTestData";
import { ForskuddHeader } from "../../components/header/ForskuddHeader";
import { ForskuddProvider } from "../../context/ForskuddContext";
import environment from "../../environment";
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

const server = setupServer(
    rest.post(`http://localhost/token`, (req, res, ctx) => {
        return res(ctx.text("123334343"));
    }),
    rest.options(`${environment.url.bidragBehandling}/api/behandling/:behandlingId`, (req, res, ctx) => {
        return res(ctx.set({ "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Origin": "*" }));
    }),
    rest.options(`${environment.url.bidragBehandling}/api/behandling/:behandlingId/beregn`, (req, res, ctx) => {
        return res(ctx.set({ "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Origin": "*" }));
    }),
    rest.options(
        `${environment.url.bidragBehandling}/api/behandling/:behandlingId/virkningstidspunkt`,
        (req, res, ctx) => {
            return res(ctx.set({ "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Origin": "*" }));
        }
    ),
    rest.options(`${environment.url.bidragBehandling}/api/behandling/:behandlingId/boforhold`, (req, res, ctx) => {
        return res(ctx.set({ "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Origin": "*" }));
    }),
    rest.get(`${environment.url.bidragBehandling}/api/behandling/:behandlingId/boforhold`, (req, res, ctx) => {
        return res(
            ctx.set({
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
            }),
            ctx.body(JSON.stringify(boforholdData))
        );
    }),
    rest.post(`${environment.url.bidragBehandling}/api/behandling/:behandlingId/beregn`, (req, res, ctx) => {
        return res(
            ctx.set({
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
            }),
            ctx.body(JSON.stringify({}))
        );
    }),
    rest.get(`${environment.url.bidragBehandling}/api/behandling/:behandlingId/virkningstidspunkt`, (req, res, ctx) => {
        return res(
            ctx.set({
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
            }),
            ctx.body(JSON.stringify(virkningstidspunktTestData))
        );
    }),
    rest.get(`${environment.url.bidragBehandling}/api/behandling/:behandlingId`, (req, res, ctx) => {
        return res(
            ctx.set({
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
            }),
            ctx.body(JSON.stringify(behandlingMockApiData))
        );
    }),
    rest.options(`${environment.url.bidragPerson}/informasjon`, (req, res, ctx) => {
        return res(ctx.set({ "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Origin": "*" }));
    }),
    rest.post(`${environment.url.bidragPerson}/informasjon`, (req, res, ctx) => {
        return res(
            ctx.set({
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
            }),
            ctx.body(
                JSON.stringify({
                    ident: "03522150877",
                    navn: "Forsikring, Kognitiv",
                    fornavn: "Kognitiv",
                    etternavn: "Forsikring",
                    kjønn: "KVINNE",
                    kjoenn: "KVINNE",
                    fødselsdato: "2021-12-03",
                    foedselsdato: "2021-12-03",
                    aktørId: "2601080498043",
                    aktoerId: "2601080498043",
                    kortnavn: "Kognitiv Forsikring",
                    kortNavn: "Kognitiv Forsikring",
                })
            )
        );
    })
);

before(() => {
    server.listen();
    sinon.stub(global, "fetch").callsFake((url, ...params) => {
        const absoluteURL = url.startsWith("/") ? `http://localhost${url}` : url;
        return origFetch(absoluteURL, ...params);
    });
});

afterEach(() => server.resetHandlers());
after(() => server.close());

describe("ForskuddPage", () => {
    it("should render Virkningstidspunkt", async () => {
        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <ForskuddProvider behandlingId={Number(1)}>
                    <ForskuddPage />
                </ForskuddProvider>
            </QueryClientProvider>,
            { route: "/forskudd/1?steg=virkningstidspunkt" }
        );

        await waitFor(() => {
            const activeStepButton = document.querySelector(".navds-stepper__step--active");
            expect(activeStepButton.innerHTML).includes("Virkningstidspunkt");
        });
    });

    it("should render Boforhold", async () => {
        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <ForskuddProvider behandlingId={1}>
                    <ForskuddPage />
                </ForskuddProvider>
            </QueryClientProvider>,
            { route: "/forskudd/1?steg=boforhold" }
        );

        await waitFor(() => {
            const activeStepButton = document.querySelector(".navds-stepper__step--active");
            expect(activeStepButton.innerHTML).includes("Boforhold");
        });
    });

    it("should render Vedtak", async () => {
        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <ForskuddProvider behandlingId={1}>
                    <ForskuddPage />
                </ForskuddProvider>
            </QueryClientProvider>,
            { route: "/forskudd/1?steg=vedtak" }
        );

        await waitFor(() => {
            const activeStepButton = document.querySelector(".navds-stepper__step--active");
            expect(activeStepButton.innerHTML).includes("Vedtak");
        });
    });

    it("should render header with roles", async () => {
        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <ForskuddProvider behandlingId={1}>
                    <ForskuddHeader />
                </ForskuddProvider>
            </QueryClientProvider>,
            { route: "/forskudd/1?steg=virkningstidspunkt" }
        );

        await waitFor(() => {
            const heading = screen.getByText("Søknad om forskudd");
            const buttons = screen.getAllByRole("button");
            const buttonTexts = [
                `Kopier ${behandlingMockApiData.saksnummer}`,
                ...behandlingMockApiData.roller.map((rolle) => `Kopier ${rolle.ident}`),
            ];
            buttons.every((button, index) => {
                expect(button.innerHTML).includes(buttonTexts[index]);
            });
            expect(heading.innerHTML).includes(`Saksnr. ${behandlingMockApiData.saksnummer}`);
        });
    });
});
