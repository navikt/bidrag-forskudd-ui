import { rest, RestHandler } from "msw";

import environment from "../../environment";
import { behandlingMockApiData } from "../testdata/behandlingTestData";

export function behandlingMock(): RestHandler[] {
    return [
        rest.get(`${environment.url.bidragBehandling}/api/behandling/:behandlingId`, (req, res, ctx) => {
            if (!localStorage.getItem(`behandling-${req.params.behandlingId}`)) {
                localStorage.setItem(`behandlingId`, req.params.behandlingId.toString());
                localStorage.setItem(`behandling-${req.params.behandlingId}`, JSON.stringify(behandlingMockApiData));
            }
            return res(
                ctx.set("Content-Type", "application/json"),
                ctx.body(localStorage.getItem(`behandling-${req.params.behandlingId}`))
            );
        }),
        rest.put(`${environment.url.bidragBehandling}/api/behandling/:behandlingId`, async (req, res, ctx) => {
            const body = await req.json();
            const behandling = JSON.parse(localStorage.getItem(`behandling-${req.params.behandlingId}`));
            const updatedBehandling = { ...behandling, ...body };

            const sucessHeaders = [
                ctx.set("Content-Type", "application/json"),
                ctx.status(200),
                ctx.body(JSON.stringify(updatedBehandling)),
            ];
            const errorHeaders = [
                ctx.status(503),
                ctx.json({
                    errorMessage: "Service Unavailable",
                }),
            ];

            const index = Math.random() < 0.9 ? 0 : 1;
            const response = [sucessHeaders, errorHeaders];

            if (index === 0) {
                localStorage.setItem(`behandling-${req.params.behandlingId}`, JSON.stringify(updatedBehandling));
            }

            return res(...response[index]);
        }),
        rest.get(
            `${environment.url.bidragBehandling}/api/behandling/:behandlingId/opplysninger/:opplysninger/aktiv`,
            (req, res, ctx) => {
                const key = `behandling-${req.params.behandlingId}-opplysninger-${req.params.opplysninger}`;

                if (!localStorage.getItem(key)) {
                    return res(ctx.set("Content-Type", "application/json"), ctx.status(404));
                }
                return res(ctx.set("Content-Type", "application/json"), ctx.body(localStorage.getItem(key)));
            }
        ),
    ];
}
