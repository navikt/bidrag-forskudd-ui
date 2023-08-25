import { rest, RestHandler } from "msw";

import environment from "../../environment";
import { bidragInntektTestData } from "../testdata/bidragInntektTestData";

export default function inntektTransformerMock(): RestHandler[] {
    return [
        rest.post(`${environment.url.bidragInntekt}/transformer`, async (req, res, ctx) => {
            return res(
                ctx.set("Content-Type", "application/json"),
                ctx.status(200),
                ctx.body(JSON.stringify(bidragInntektTestData))
            );
        }),
    ];
}
