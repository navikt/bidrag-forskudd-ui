import { rest, RestHandler } from "msw";

import environment from "../../environment";
import { behandlingMockApiData } from "../testdata/behandlingTestData";

export function hentBehandlingMock(): RestHandler[] {
    return [
        rest.get(`${environment.url.bidragBehandling}/api/behandling/:behandlingId`, (req, res, ctx) => {
            return res(ctx.set("Content-Type", "application/json"), ctx.body(JSON.stringify(behandlingMockApiData)));
        }),
    ];
}
