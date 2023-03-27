import { rest, RestHandler } from "msw";

import environment from "../../environment";
import { behandlingMockApiData } from "../testdata/behandlingTestData";

export function behandlingMock(): RestHandler[] {
    return [
        rest.get(`${environment.url.bidragBehandling}/api/behandling/:behandlingId`, (req, res, ctx) => {
            if (!localStorage.getItem(`behandling-${req.params.behandlingId}`)) {
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
            localStorage.setItem(`behandling-${req.params.behandlingId}`, JSON.stringify(updatedBehandling));
            return res(
                ctx.set("Content-Type", "application/json"),
                ctx.status(200),
                ctx.body(JSON.stringify(updatedBehandling))
            );
        }),
    ];
}
