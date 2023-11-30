import { rest, RestHandler, RestRequest } from "msw";

import environment from "../../environment";
import { PersonDto } from "../../types/personTypes";
import { createHustandsmedlemmer } from "../testdata/grunnlagTestData";

export default function personMock(): RestHandler[] {
    const baseUrl = environment.url.bidragPerson;
    return [
        rest.post(`${baseUrl}/informasjon`, async (req, res, ctx) => {
            const requestBody = await req.json();

            if (requestBody.ident === "errorIdent") {
                return res(
                    ctx.set("Content-Type", "application/json"),
                    // Respond with the "ArrayBuffer".
                    ctx.status(404)
                );
            }

            const name = generateName();
            const lastIndex = name.lastIndexOf(" ");
            const shortName = name.substring(0, lastIndex);

            return res(
                ctx.set("Content-Type", "application/json"),
                // Respond with the "ArrayBuffer".
                ctx.body(
                    JSON.stringify({
                        ident: requestBody.ident,
                        navn: name,
                        visningsnavn: shortName,
                    } as PersonDto)
                )
            );
        }),
        rest.post(`${baseUrl}/husstandsmedlemmer`, async (req: RestRequest, res, ctx) => {
            return res(
                ctx.set("Content-Type", "application/json"),
                ctx.status(200),
                ctx.body(JSON.stringify(createHustandsmedlemmer()))
            );
        }),
    ];
}

const names = {
    female: [
        "Nora",
        "Emma",
        "Olivia",
        "Ella",
        "Sofie",
        "Sophie",
        "Leah",
        "Lea",
        "Frida",
        "Iben",
        "Sofia",
        "Sophia",
        "Sarah",
        "Zara",
    ],
    male: [
        "Jakob",
        "Jacob",
        "Noah",
        "Noa",
        "Emil",
        "Lucas",
        "Lukas",
        "Oliver",
        "Isak",
        "William",
        "Filip",
        "Philip",
        "Aksel",
        "Theodor",
    ],
    lastName: [
        "Hansen",
        "Johansen",
        "Olsen",
        "Larsen",
        "Andersen",
        "Pedersen",
        "Nilsen",
        "Kristiansen",
        "Jensen",
        "Karlsen",
        "Johnsen",
        "Pettersen",
        "Eriksen",
        "Berg",
        "Haugen",
    ],
};

export const generateName = () => {
    const sex = Math.random() < 0.5 ? "female" : "male";
    const firstName = names[sex][Math.floor(Math.random() * names[sex].length)];
    const middleName = names[sex][Math.floor(Math.random() * names[sex].length)];
    const lastName = names["lastName"][Math.floor(Math.random() * names["lastName"].length)];

    return `${firstName} ${middleName} ${lastName}`;
};
