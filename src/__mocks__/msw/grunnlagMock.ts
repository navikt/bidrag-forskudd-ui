import { rest, RestHandler, RestRequest } from "msw";

import environment from "../../environment";
import { createGrunnlagsdata } from "../testdata/grunnlagTestData";

export default function grunnlagMock(): RestHandler[] {
    const baseUrl = environment.url.bidragGrunnlag;
    return [
        rest.post(`${baseUrl}/hentgrunnlag`, async (req: RestRequest, res, ctx) => {
            if (!localStorage.getItem(`behandling-grunnlag`)) {
                const behandlingId = localStorage.getItem("behandlingId");
                const behandling = JSON.parse(localStorage.getItem(`behandling-${behandlingId}`));
                localStorage.setItem(`behandling-grunnlag`, JSON.stringify(createGrunnlagsdata(behandling)));
            }
            return res(
                ctx.set("Content-Type", "application/json"),
                ctx.body(localStorage.getItem(`behandling-grunnlag`))
            );
        }),
    ];
}
