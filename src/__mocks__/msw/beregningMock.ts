import { rest, RestHandler } from "msw";

import environment from "../../environment";

export function beregningMock(): RestHandler[] {
    return [
        rest.post(`${environment.url.bidragBehandling}/api/v1/behandling/:behandlingId/beregn`, (req, res, ctx) => {
            return res(
                ctx.set("Content-Type", "application/json"),
                ctx.body(
                    JSON.stringify([
                        {
                            barn: {
                                ident: "26472252274",
                                navn: "Geometrisk Detalj",
                                fødselsdato: "2022-07-26",
                            },
                            perioder: [
                                {
                                    periode: {
                                        fom: "2022-08",
                                        til: "2023-01",
                                    },
                                    beløp: 1760,
                                    resultatKode: "FORHØYET_FORSKUDD_100_PROSENT",
                                    regel: "REGEL 6",
                                    sivilstand: "BOR_ALENE_MED_BARN",
                                    inntekt: 0,
                                    antallBarnIHusstanden: 4,
                                },
                                {
                                    periode: {
                                        fom: "2023-01",
                                        til: "2023-03",
                                    },
                                    beløp: 1760,
                                    resultatKode: "FORHØYET_FORSKUDD_100_PROSENT",
                                    regel: "REGEL 6",
                                    sivilstand: "BOR_ALENE_MED_BARN",
                                    inntekt: 0,
                                    antallBarnIHusstanden: 4,
                                },
                                {
                                    periode: {
                                        fom: "2023-03",
                                        til: "2023-07",
                                    },
                                    beløp: 0,
                                    resultatKode: "AVSLAG",
                                    regel: "REGEL 4",
                                    sivilstand: "BOR_ALENE_MED_BARN",
                                    inntekt: 628000,
                                    antallBarnIHusstanden: 4,
                                },
                                {
                                    periode: {
                                        fom: "2023-07",
                                        til: "2023-10",
                                    },
                                    beløp: 0,
                                    resultatKode: "AVSLAG",
                                    regel: "REGEL 4",
                                    sivilstand: "BOR_ALENE_MED_BARN",
                                    inntekt: 628000,
                                    antallBarnIHusstanden: 4,
                                },
                                {
                                    periode: {
                                        fom: "2023-10",
                                        til: "2023-12",
                                    },
                                    beløp: 0,
                                    resultatKode: "AVSLAG",
                                    regel: "REGEL 4",
                                    sivilstand: "BOR_ALENE_MED_BARN",
                                    inntekt: 628000,
                                    antallBarnIHusstanden: 3,
                                },
                                {
                                    periode: {
                                        fom: "2023-12",
                                        til: "2024-02",
                                    },
                                    beløp: 0,
                                    resultatKode: "AVSLAG",
                                    regel: "REGEL 4",
                                    sivilstand: "BOR_ALENE_MED_BARN",
                                    inntekt: 628000,
                                    antallBarnIHusstanden: 3,
                                },
                                {
                                    periode: {
                                        fom: "2024-02",
                                    },
                                    beløp: 1880,
                                    resultatKode: "FORHØYET_FORSKUDD_100_PROSENT",
                                    regel: "REGEL 6",
                                    sivilstand: "BOR_ALENE_MED_BARN",
                                    inntekt: 0,
                                    antallBarnIHusstanden: 3,
                                },
                            ],
                        },
                        {
                            barn: {
                                ident: "13451585880",
                                navn: "Normal Utnyttende Pakke",
                                fødselsdato: "2015-05-13",
                            },
                            perioder: [
                                {
                                    periode: {
                                        fom: "2022-08",
                                        til: "2023-01",
                                    },
                                    beløp: 1760,
                                    resultatKode: "FORHØYET_FORSKUDD_100_PROSENT",
                                    regel: "REGEL 6",
                                    sivilstand: "BOR_ALENE_MED_BARN",
                                    inntekt: 0,
                                    antallBarnIHusstanden: 4,
                                },
                                {
                                    periode: {
                                        fom: "2023-01",
                                        til: "2023-03",
                                    },
                                    beløp: 1760,
                                    resultatKode: "FORHØYET_FORSKUDD_100_PROSENT",
                                    regel: "REGEL 6",
                                    sivilstand: "BOR_ALENE_MED_BARN",
                                    inntekt: 0,
                                    antallBarnIHusstanden: 4,
                                },
                                {
                                    periode: {
                                        fom: "2023-03",
                                        til: "2023-07",
                                    },
                                    beløp: 0,
                                    resultatKode: "AVSLAG",
                                    regel: "REGEL 4",
                                    sivilstand: "BOR_ALENE_MED_BARN",
                                    inntekt: 628000,
                                    antallBarnIHusstanden: 4,
                                },
                                {
                                    periode: {
                                        fom: "2023-07",
                                        til: "2023-10",
                                    },
                                    beløp: 0,
                                    resultatKode: "AVSLAG",
                                    regel: "REGEL 4",
                                    sivilstand: "BOR_ALENE_MED_BARN",
                                    inntekt: 628000,
                                    antallBarnIHusstanden: 4,
                                },
                                {
                                    periode: {
                                        fom: "2023-10",
                                        til: "2023-12",
                                    },
                                    beløp: 0,
                                    resultatKode: "AVSLAG",
                                    regel: "REGEL 4",
                                    sivilstand: "BOR_ALENE_MED_BARN",
                                    inntekt: 628000,
                                    antallBarnIHusstanden: 3,
                                },
                                {
                                    periode: {
                                        fom: "2023-12",
                                        til: "2024-02",
                                    },
                                    beløp: 0,
                                    resultatKode: "AVSLAG",
                                    regel: "REGEL 4",
                                    sivilstand: "BOR_ALENE_MED_BARN",
                                    inntekt: 628000,
                                    antallBarnIHusstanden: 3,
                                },
                                {
                                    periode: {
                                        fom: "2024-02",
                                    },
                                    beløp: 1880,
                                    resultatKode: "FORHØYET_FORSKUDD_100_PROSENT",
                                    regel: "REGEL 6",
                                    sivilstand: "BOR_ALENE_MED_BARN",
                                    inntekt: 0,
                                    antallBarnIHusstanden: 3,
                                },
                            ],
                        },
                    ])
                )
            );
        }),
    ];
}
