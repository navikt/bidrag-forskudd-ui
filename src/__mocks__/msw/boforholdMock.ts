import { rest, RestHandler } from "msw";

import environment from "../../environment";
import { boforholdData } from "../testdata/boforholdTestData";

export default function boforholdMock(): RestHandler[] {
    return [
        rest.get(`${environment.url.bidragBehandling}/api/behandling/:behandlingId/boforhold`, (req, res, ctx) => {
            if (!localStorage.getItem(`behandling-${req.params.behandlingId}-boforhold`)) {
                localStorage.setItem(`behandling-${req.params.behandlingId}-boforhold`, JSON.stringify(boforholdData));
            }
            return res(
                ctx.set("Content-Type", "application/json"),
                ctx.body(localStorage.getItem(`behandling-${req.params.behandlingId}-boforhold`))
            );
        }),
        rest.put(
            `${environment.url.bidragBehandling}/api/behandling/:behandlingId/boforhold`,
            async (req, res, ctx) => {
                const body = await req.json();
                localStorage.setItem(`behandling-${req.params.behandlingId}-boforhold`, JSON.stringify(body));

                return res(
                    ctx.set("Content-Type", "application/json"),
                    ctx.status(200),
                    ctx.body(JSON.stringify(body))
                );
            }
        ),
    ];
}
