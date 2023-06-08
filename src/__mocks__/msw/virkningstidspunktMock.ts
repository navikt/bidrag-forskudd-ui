import { rest, RestHandler } from "msw";

import environment from "../../environment";
import { virkningstidspunktTestData } from "../testdata/virkningstidspunktTestData";

export default function virkningstidspunktMock(): RestHandler[] {
    return [
        rest.get(
            `${environment.url.bidragBehandling}/api/behandling/:behandlingId/virkningstidspunkt`,
            (req, res, ctx) => {
                if (!localStorage.getItem(`behandling-${req.params.behandlingId}-virkningstidspunkt`)) {
                    localStorage.setItem(
                        `behandling-${req.params.behandlingId}-virkningstidspunkt`,
                        JSON.stringify(virkningstidspunktTestData)
                    );
                }
                return res(
                    ctx.set("Content-Type", "application/json"),
                    ctx.body(localStorage.getItem(`behandling-${req.params.behandlingId}-virkningstidspunkt`))
                );
            }
        ),
        rest.put(
            `${environment.url.bidragBehandling}/api/behandling/:behandlingId/virkningstidspunkt`,
            async (req, res, ctx) => {
                const body = await req.json();
                const virkningstidspunkt = JSON.parse(
                    localStorage.getItem(`behandling-${req.params.behandlingId}-virkningstidspunkt`)
                );
                const updatedVirkningstidspunkt = { ...virkningstidspunkt, ...body };
                localStorage.setItem(
                    `behandling-${req.params.behandlingId}-virkningstidspunkt`,
                    JSON.stringify(updatedVirkningstidspunkt)
                );

                return res(
                    ctx.set("Content-Type", "application/json"),
                    ctx.status(200),
                    ctx.body(JSON.stringify(updatedVirkningstidspunkt))
                );
            }
        ),
    ];
}
