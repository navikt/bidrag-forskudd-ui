import { rest, RestHandler, RestRequest } from "msw";

import environment from "../../environment";
import { createSkattegrunnlag } from "../testdata/grunnlagTestData";

export default function grunnlagMock(): RestHandler[] {
    const baseUrl = environment.url.bidragGrunnlag;
    return [
        rest.post(`${baseUrl}/integrasjoner/skattegrunnlag`, async (req: RestRequest, res, ctx) => {
            const requestBody = await req.json();
            return res(
                ctx.set("Content-Type", "application/json"),
                ctx.status(200),
                ctx.body(JSON.stringify(createSkattegrunnlag()))
            );
        }),
    ];
}
