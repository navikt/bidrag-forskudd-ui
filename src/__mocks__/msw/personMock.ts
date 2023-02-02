import { rest, RestHandler } from "msw";

import environment from "../../environment";

export default function personMock(): RestHandler[] {
    const baseUrl = environment.url.bidragPerson;
    return [
        rest.get(`${baseUrl}/informasjon/:personId`, (req, res, ctx) => {
            return res(
                ctx.set("Content-Type", "application/json"),
                // Respond with the "ArrayBuffer".
                ctx.body(
                    JSON.stringify({
                        personId: req.params.personId as string,
                        navn: "Navn Test",
                        aktoerId: "123123213123",
                    })
                )
            );
        }),
    ];
}
