import { rest, RestHandler, RestRequest } from "msw";

import environment from "../../environment";
import { getRandomInt } from "../../utils/number-utils";
import { createGrunnlagspakkeData, createGrunnlagspakkeOppdaterData } from "../testdata/grunnlagTestData";

export default function grunnlagMock(): RestHandler[] {
    const baseUrl = environment.url.bidragGrunnlag;
    return [
        rest.post(`${baseUrl}/grunnlagspakke`, async (req: RestRequest, res, ctx) => {
            return res(
                ctx.set("Content-Type", "application/json"),
                ctx.status(200),
                ctx.body(getRandomInt().toString())
            );
        }),
        rest.post(`${baseUrl}/grunnlagspakke/:grunnlagspakkeId/oppdater`, async (req: RestRequest, res, ctx) => {
            if (!localStorage.getItem(`behandling-${req.params.grunnlagspakkeId}-grunnlagspakke-oppdater`)) {
                const behandlingId = localStorage.getItem("behandlingId");
                const behandling = JSON.parse(localStorage.getItem(`behandling-${behandlingId}`));
                localStorage.setItem(
                    `behandling-${req.params.grunnlagspakkeId}-grunnlagspakke-oppdater`,
                    JSON.stringify(createGrunnlagspakkeOppdaterData(behandling))
                );
            }
            return res(
                ctx.set("Content-Type", "application/json"),
                ctx.status(200),
                ctx.body(localStorage.getItem(`behandling-${req.params.grunnlagspakkeId}-grunnlagspakke-oppdater`))
            );
        }),
        rest.get(`${baseUrl}/grunnlagspakke/:grunnlagspakkeId`, async (req: RestRequest, res, ctx) => {
            if (!localStorage.getItem(`behandling-${req.params.grunnlagspakkeId}-grunnlagspakke`)) {
                const behandlingId = localStorage.getItem("behandlingId");
                const behandling = JSON.parse(localStorage.getItem(`behandling-${behandlingId}`));
                localStorage.setItem(
                    `behandling-${req.params.grunnlagspakkeId}-grunnlagspakke`,
                    JSON.stringify(createGrunnlagspakkeData(req.params.grunnlagspakkeId, behandling))
                );
            }
            return res(
                ctx.set("Content-Type", "application/json"),
                ctx.body(localStorage.getItem(`behandling-${req.params.grunnlagspakkeId}-grunnlagspakke`))
            );
        }),
    ];
}
