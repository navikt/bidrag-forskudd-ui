import { rest, RestHandler } from "msw";

import environment from "../../environment";
import { bidragsak } from "../testdata/sakTestData";

export function hentSakMock(): RestHandler[] {
    return [
        rest.get(`${environment.url.bidragSak}/bidrag-sak/sak/:saksnummer`, (req, res, ctx) => {
            return res(ctx.set("Content-Type", "application/json"), ctx.body(JSON.stringify(bidragsak)));
        }),
    ];
}
