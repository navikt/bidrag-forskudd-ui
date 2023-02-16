import { rest, RestHandler } from "msw";

import environment from "../../environment";
import { PersonDto } from "../../types/personTypes";

export default function personMock(): RestHandler[] {
    const baseUrl = environment.url.bidragPerson;
    return [
        rest.post(`${baseUrl}/informasjon`, async (req, res, ctx) => {
            const requestBody = await req.json();
            return res(
                ctx.set("Content-Type", "application/json"),
                // Respond with the "ArrayBuffer".
                ctx.body(
                    JSON.stringify({
                        ident: requestBody.ident,
                        navn: "Etternavn, Fornavn Middelnavn",
                    } as PersonDto)
                )
            );
        }),
    ];
}
