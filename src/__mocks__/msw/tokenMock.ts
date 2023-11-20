import { rest, RestHandler } from "msw";

export default function tokenMock(): RestHandler[] {
    return [
        rest.post(`/token`, (req, res, ctx) => {
            return res(ctx.status(200), ctx.body("some token"));
        }),
        rest.get(`/me`, (req, res, ctx) => {
            return res(
                ctx.set("Content-Type", "application/json"),
                ctx.status(200),
                ctx.body(
                    JSON.stringify({
                        displayName: "",
                        navIdent: "Z9999",
                    })
                )
            );
        }),
    ];
}
