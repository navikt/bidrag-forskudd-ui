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
                        navn: generateName(),
                    } as PersonDto)
                )
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

    return `${lastName}, ${firstName} ${middleName}`;
};
