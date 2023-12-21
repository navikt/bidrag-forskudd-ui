import { rest, RestHandler } from "msw";

import environment from "../../environment";
import { visningsNavnTestData } from "../testdata/visningsNavnTestData";

export default function visningsNavnMock(): RestHandler[] {
    return [
        rest.get(`${environment.url.bidragBehandling}/api/v1/visningsnavn`, (req, res, ctx) => {
            return res(ctx.set("Content-Type", "application/json"), ctx.body(JSON.stringify(visningsNavnTestData)));
        }),
    ];
}
