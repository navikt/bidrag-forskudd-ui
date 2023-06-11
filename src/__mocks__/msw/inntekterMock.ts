import { rest, RestHandler } from "msw";

import environment from "../../environment";
import { inntektTestData } from "../testdata/inntektTestData";

export default function inntektMock(): RestHandler[] {
    return [
        rest.get(`${environment.url.bidragBehandling}/api/behandling/:behandlingId/inntekter`, (req, res, ctx) => {
            if (!localStorage.getItem(`behandling-${req.params.behandlingId}-inntekter`)) {
                localStorage.setItem(
                    `behandling-${req.params.behandlingId}-inntekter`,
                    JSON.stringify(inntektTestData)
                );
            }
            return res(
                ctx.set("Content-Type", "application/json"),
                ctx.body(localStorage.getItem(`behandling-${req.params.behandlingId}-inntekter`))
            );
        }),
        rest.put(
            `${environment.url.bidragBehandling}/api/behandling/:behandlingId/inntekter`,
            async (req, res, ctx) => {
                const body = await req.json();
                localStorage.setItem(`behandling-${req.params.behandlingId}-inntekter`, JSON.stringify(body));

                return res(
                    ctx.set("Content-Type", "application/json"),
                    ctx.status(200),
                    ctx.body(JSON.stringify(body))
                );
            }
        ),
    ];
}
