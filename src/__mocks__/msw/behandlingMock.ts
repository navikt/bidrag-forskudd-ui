import { rest, RestHandler } from "msw";

import {
    AddOpplysningerRequest,
    BehandlingDto,
    GrunnlagsdataDto,
    OppdaterBehandlingRequest,
} from "../../api/BidragBehandlingApiV1";
import environment from "../../environment";
import { behandlingMockApiData } from "../testdata/behandlingTestData";
import { behandlingMockApiDataV2 } from "../testdata/behandlingTestDataV2";

export function behandlingMock(): RestHandler[] {
    return [
        rest.get(`${environment.url.bidragBehandling}/api/v1/behandling/:behandlingId`, (req, res, ctx) => {
            if (!localStorage.getItem(`behandling-${req.params.behandlingId}`)) {
                localStorage.setItem(`behandlingId`, req.params.behandlingId.toString());
                localStorage.setItem(`behandling-${req.params.behandlingId}`, JSON.stringify(behandlingMockApiData));
            }
            return res(
                ctx.set("Content-Type", "application/json"),
                ctx.body(localStorage.getItem(`behandling-${req.params.behandlingId}`))
            );
        }),
        rest.get(`${environment.url.bidragBehandling}/api/v2/behandling/:behandlingId`, (req, res, ctx) => {
            if (!localStorage.getItem(`behandling-${req.params.behandlingId}-V2`)) {
                localStorage.setItem(`behandlingId`, req.params.behandlingId.toString());
                localStorage.setItem(
                    `behandling-${req.params.behandlingId}-V2`,
                    JSON.stringify(behandlingMockApiDataV2)
                );
            }
            return res(
                ctx.set("Content-Type", "application/json"),
                ctx.body(localStorage.getItem(`behandling-${req.params.behandlingId}-V2`))
            );
        }),
        rest.put(`${environment.url.bidragBehandling}/api/v1/behandling/:behandlingId`, async (req, res, ctx) => {
            const body = await req.json();
            const behandling = JSON.parse(
                localStorage.getItem(`behandling-${req.params.behandlingId}`)
            ) as BehandlingDto;
            const oppdater = body as OppdaterBehandlingRequest;
            const updatedBehandling: BehandlingDto = {
                ...behandling,
                ...oppdater,
                grunnlagspakkeid: oppdater.grunnlagspakkeId,
                inntekter: {
                    ...behandling?.inntekter,
                    ...oppdater?.inntekter,
                },
                boforhold: {
                    ...behandling?.boforhold,
                    ...oppdater?.boforhold,
                },
                virkningstidspunkt: {
                    ...behandling?.virkningstidspunkt,
                    ...oppdater?.virkningstidspunkt,
                },
            };
            // @ts-ignore
            delete updatedBehandling.grunnlagspakkeId;

            const sucessHeaders = [
                ctx.set("Content-Type", "application/json"),
                ctx.status(200),
                ctx.body(JSON.stringify(updatedBehandling)),
            ];
            // const errorHeaders = [
            //     ctx.status(503),
            //     ctx.json({
            //         errorMessage: "Service Unavailable",
            //     }),
            // ];
            //
            // const index = Math.random() < 0.9 ? 0 : 1;
            // const response = [sucessHeaders, errorHeaders];
            const index = 0;
            const response = [sucessHeaders];

            if (index === 0) {
                localStorage.setItem(`behandling-${req.params.behandlingId}`, JSON.stringify(updatedBehandling));
            }

            return res(...response[index]);
        }),

        rest.post(
            `${environment.url.bidragBehandling}/api/v1/behandling/:behandlingId/opplysninger`,
            async (req, res, ctx) => {
                const data = (await req.json()) as AddOpplysningerRequest;
                const response: GrunnlagsdataDto = {
                    ...data,
                    id: 1,
                    grunnlagsdatatype: data.grunnlagstype,
                    innhentet: data.hentetDato,
                    behandlingsid: req.params.behandlingId as unknown as number,
                };
                const behandling = JSON.parse(
                    localStorage.getItem(`behandling-${req.params.behandlingId}`)
                ) as BehandlingDto;
                const opplysningerExists = behandling.opplysninger.some(
                    (opplysning) => opplysning.grunnlagsdatatype == data.grunnlagstype
                );
                const opplysninger = opplysningerExists
                    ? behandling.opplysninger.map((saved) => {
                          if (saved.grunnlagsdatatype == response.grunnlagsdatatype) {
                              return response;
                          }
                          return saved;
                      })
                    : [...behandling.opplysninger, response];
                const updatedBehandling: BehandlingDto = {
                    ...behandling,
                    opplysninger,
                };
                localStorage.setItem(`behandling-${req.params.behandlingId}`, JSON.stringify(updatedBehandling));

                return res(
                    ctx.set("Content-Type", "application/json"),
                    ctx.status(200),
                    ctx.body(JSON.stringify(response))
                );
            }
        ),
    ];
}
