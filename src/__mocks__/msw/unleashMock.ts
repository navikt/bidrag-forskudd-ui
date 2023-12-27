import { rest, RestHandler, RestRequest } from "msw";

export default function unleashMock(): RestHandler[] {
    return [
        rest.get(`${process.env.UNLEASH_API_URL}`, async (req: RestRequest, res, ctx) => {
            return res(
                ctx.status(200),
                ctx.set("Content-Type", "application/json"),
                ctx.body(
                    JSON.stringify({
                        toggles: [
                            {
                                name: "behandling.fattevedtak",
                                enabled: false,
                                variant: {
                                    name: "disabled",
                                    enabled: false,
                                },
                                impressionData: true,
                            },
                            {
                                name: "behandling.skjermbilde.vedtak",
                                enabled: true,
                                variant: {
                                    name: "disabled",
                                    enabled: false,
                                },
                                impressionData: true,
                            },
                            {
                                name: "behandling.skjermbilde.inntekter",
                                enabled: true,
                                variant: {
                                    name: "disabled",
                                    enabled: false,
                                },
                                impressionData: true,
                            },
                        ],
                    })
                )
            );
        }),
    ];
}
