import { rest, RestHandler } from "msw";

import environment from "../../environment";
import { generateName } from "./personMock";

export function beregningMock(): RestHandler[] {
    return [
        rest.post(`${environment.url.bidragBehandling}/api/v1/behandling/:behandlingId/beregn`, (req, res, ctx) => {
            return res(
                ctx.set("Content-Type", "application/json"),
                ctx.body(
                    JSON.stringify({
                        resultatBarn: [
                            {
                                barn: {
                                    ident: "03522150877",
                                    navn: generateName(),
                                    fødselsdato: "2015-07-24",
                                },
                                resultat: {
                                    beregnetForskuddPeriodeListe: [
                                        {
                                            periode: {
                                                fom: "2022-01",
                                                til: "2022-07",
                                            },
                                            resultat: {
                                                belop: 1.71e3,
                                                kode: "FORHØYET_FORSKUDD_100_PROSENT",
                                                regel: "REGEL 6",
                                            },
                                            grunnlagsreferanseListe: [
                                                "Inntekt_LØNN_MANUELT_BEREGNET_person-bidragsmottaker_20220101",
                                                "Sjablon_Forskuddssats75ProsentBeløp_20210701",
                                                "Sjablon_ForskuddssatsBeløp_20210701",
                                                "Sjablon_InntektsintervallForskuddBeløp_20210701",
                                                "Sjablon_MaksInntektForskuddMottakerMultiplikator_20030101",
                                                "Sjablon_ØvreInntektsgrense75ProsentForskuddEnBeløp_20210701",
                                                "Sjablon_ØvreInntektsgrense75ProsentForskuddGSBeløp_20210701",
                                                "Sjablon_ØvreInntektsgrenseFulltForskuddBeløp_20210701",
                                                "bostatus-person-husstandsbarn-1619-20220101",
                                                "bostatus-person-husstandsbarn-1620-20220101",
                                                "bostatus-person-søkandsbarn-688-20220101",
                                                "person-søkandsbarn-688",
                                                "sivilstand-person-bidragsmottaker-20220101",
                                            ],
                                        },
                                        {
                                            periode: {
                                                fom: "2022-07",
                                                til: "2023-06",
                                            },
                                            resultat: {
                                                belop: 1.76e3,
                                                kode: "FORHØYET_FORSKUDD_100_PROSENT",
                                                regel: "REGEL 6",
                                            },
                                            grunnlagsreferanseListe: [
                                                "Inntekt_LØNN_MANUELT_BEREGNET_person-bidragsmottaker_20220101",
                                                "Sjablon_Forskuddssats75ProsentBeløp_20220701",
                                                "Sjablon_ForskuddssatsBeløp_20220701",
                                                "Sjablon_InntektsintervallForskuddBeløp_20220701",
                                                "Sjablon_MaksInntektForskuddMottakerMultiplikator_20030101",
                                                "Sjablon_ØvreInntektsgrense75ProsentForskuddEnBeløp_20220701",
                                                "Sjablon_ØvreInntektsgrense75ProsentForskuddGSBeløp_20220701",
                                                "Sjablon_ØvreInntektsgrenseFulltForskuddBeløp_20220701",
                                                "bostatus-person-husstandsbarn-1619-20220101",
                                                "bostatus-person-husstandsbarn-1620-20220101",
                                                "bostatus-person-søkandsbarn-688-20220101",
                                                "person-søkandsbarn-688",
                                                "sivilstand-person-bidragsmottaker-20220101",
                                            ],
                                        },
                                        {
                                            periode: {
                                                fom: "2023-06",
                                                til: "2023-07",
                                            },
                                            resultat: {
                                                belop: 1.76e3,
                                                kode: "FORHØYET_FORSKUDD_100_PROSENT",
                                                regel: "REGEL 6",
                                            },
                                            grunnlagsreferanseListe: [
                                                "Inntekt_LØNN_MANUELT_BEREGNET_person-bidragsmottaker_20220101",
                                                "Inntekt_SMÅBARNSTILLEGG_person-bidragsmottaker_20230601",
                                                "Sjablon_Forskuddssats75ProsentBeløp_20220701",
                                                "Sjablon_ForskuddssatsBeløp_20220701",
                                                "Sjablon_InntektsintervallForskuddBeløp_20220701",
                                                "Sjablon_MaksInntektForskuddMottakerMultiplikator_20030101",
                                                "Sjablon_ØvreInntektsgrense75ProsentForskuddEnBeløp_20220701",
                                                "Sjablon_ØvreInntektsgrense75ProsentForskuddGSBeløp_20220701",
                                                "Sjablon_ØvreInntektsgrenseFulltForskuddBeløp_20220701",
                                                "bostatus-person-husstandsbarn-1619-20220101",
                                                "bostatus-person-husstandsbarn-1620-20220101",
                                                "bostatus-person-søkandsbarn-688-20220101",
                                                "person-søkandsbarn-688",
                                                "sivilstand-person-bidragsmottaker-20220101",
                                            ],
                                        },
                                        {
                                            periode: {
                                                fom: "2023-07",
                                                til: "2026-07",
                                            },
                                            resultat: {
                                                belop: 1.88e3,
                                                kode: "FORHØYET_FORSKUDD_100_PROSENT",
                                                regel: "REGEL 6",
                                            },
                                            grunnlagsreferanseListe: [
                                                "Inntekt_LØNN_MANUELT_BEREGNET_person-bidragsmottaker_20220101",
                                                "Inntekt_SMÅBARNSTILLEGG_person-bidragsmottaker_20230601",
                                                "Sjablon_Forskuddssats75ProsentBeløp_20230701",
                                                "Sjablon_ForskuddssatsBeløp_20230701",
                                                "Sjablon_InntektsintervallForskuddBeløp_20230701",
                                                "Sjablon_MaksInntektForskuddMottakerMultiplikator_20230701",
                                                "Sjablon_ØvreInntektsgrense75ProsentForskuddEnBeløp_20230701",
                                                "Sjablon_ØvreInntektsgrense75ProsentForskuddGSBeløp_20230701",
                                                "Sjablon_ØvreInntektsgrenseFulltForskuddBeløp_20230701",
                                                "bostatus-person-husstandsbarn-1619-20220101",
                                                "bostatus-person-husstandsbarn-1620-20220101",
                                                "bostatus-person-søkandsbarn-688-20220101",
                                                "person-søkandsbarn-688",
                                                "sivilstand-person-bidragsmottaker-20220101",
                                            ],
                                        },
                                        {
                                            periode: {
                                                fom: "2026-07",
                                                til: "2033-08",
                                            },
                                            resultat: {
                                                belop: 2.35e3,
                                                kode: "FORHØYET_FORSKUDD_11_ÅR_125_PROSENT",
                                                regel: "REGEL 5",
                                            },
                                            grunnlagsreferanseListe: [
                                                "Inntekt_LØNN_MANUELT_BEREGNET_person-bidragsmottaker_20220101",
                                                "Inntekt_SMÅBARNSTILLEGG_person-bidragsmottaker_20230601",
                                                "Sjablon_Forskuddssats75ProsentBeløp_20230701",
                                                "Sjablon_ForskuddssatsBeløp_20230701",
                                                "Sjablon_InntektsintervallForskuddBeløp_20230701",
                                                "Sjablon_MaksInntektForskuddMottakerMultiplikator_20230701",
                                                "Sjablon_ØvreInntektsgrense75ProsentForskuddEnBeløp_20230701",
                                                "Sjablon_ØvreInntektsgrense75ProsentForskuddGSBeløp_20230701",
                                                "Sjablon_ØvreInntektsgrenseFulltForskuddBeløp_20230701",
                                                "bostatus-person-husstandsbarn-1619-20220101",
                                                "bostatus-person-husstandsbarn-1620-20220101",
                                                "bostatus-person-søkandsbarn-688-20220101",
                                                "person-søkandsbarn-688",
                                                "sivilstand-person-bidragsmottaker-20220101",
                                            ],
                                        },
                                        {
                                            periode: {
                                                fom: "2033-08",
                                            },
                                            resultat: {
                                                belop: 0,
                                                kode: "AVSLAG",
                                                regel: "REGEL 1",
                                            },
                                            grunnlagsreferanseListe: [
                                                "Inntekt_LØNN_MANUELT_BEREGNET_person-bidragsmottaker_20220101",
                                                "Inntekt_SMÅBARNSTILLEGG_person-bidragsmottaker_20230601",
                                                "Sjablon_Forskuddssats75ProsentBeløp_20230701",
                                                "Sjablon_ForskuddssatsBeløp_20230701",
                                                "Sjablon_InntektsintervallForskuddBeløp_20230701",
                                                "Sjablon_MaksInntektForskuddMottakerMultiplikator_20230701",
                                                "Sjablon_ØvreInntektsgrense75ProsentForskuddEnBeløp_20230701",
                                                "Sjablon_ØvreInntektsgrense75ProsentForskuddGSBeløp_20230701",
                                                "Sjablon_ØvreInntektsgrenseFulltForskuddBeløp_20230701",
                                                "bostatus-person-husstandsbarn-1619-20220101",
                                                "bostatus-person-husstandsbarn-1620-20220101",
                                                "bostatus-person-søkandsbarn-688-20220101",
                                                "person-søkandsbarn-688",
                                                "sivilstand-person-bidragsmottaker-20220101",
                                            ],
                                        },
                                    ],
                                    grunnlagListe: [
                                        {
                                            referanse: "person-søkandsbarn-688",
                                            type: "PERSON",
                                            innhold: {
                                                ident: "24471556838",
                                                navn: "Aktuell Uvitende Lind",
                                                fødselsdato: [2015, 7, 24],
                                            },
                                        },
                                        {
                                            referanse: "bostatus-person-søkandsbarn-688-20220101",
                                            type: "BOSTATUS_PERIODE",
                                            innhold: {
                                                periode: {
                                                    fom: [2022, 1],
                                                    til: null,
                                                },
                                                bostatus: "MED_FORELDER",
                                                manueltRegistrert: false,
                                            },
                                        },
                                        {
                                            referanse: "bostatus-person-husstandsbarn-1620-20220101",
                                            type: "BOSTATUS_PERIODE",
                                            innhold: {
                                                periode: {
                                                    fom: [2022, 1],
                                                    til: null,
                                                },
                                                bostatus: "MED_FORELDER",
                                                manueltRegistrert: false,
                                            },
                                        },
                                        {
                                            referanse: "bostatus-person-husstandsbarn-1619-20220101",
                                            type: "BOSTATUS_PERIODE",
                                            innhold: {
                                                periode: {
                                                    fom: [2022, 1],
                                                    til: null,
                                                },
                                                bostatus: "MED_FORELDER",
                                                manueltRegistrert: false,
                                            },
                                        },
                                        {
                                            referanse: "Inntekt_LØNN_MANUELT_BEREGNET_person-bidragsmottaker_20220101",
                                            type: "BEREGNING_INNTEKT_RAPPORTERING_PERIODE",
                                            innhold: {
                                                periode: {
                                                    fom: [2022, 1],
                                                    til: null,
                                                },
                                                inntektsrapportering: "LØNN_MANUELT_BEREGNET",
                                                gjelderBarn: null,
                                                beløp: 50000,
                                                manueltRegistrert: true,
                                                valgt: true,
                                            },
                                        },
                                        {
                                            referanse: "Inntekt_SMÅBARNSTILLEGG_person-bidragsmottaker_20230601",
                                            type: "BEREGNING_INNTEKT_RAPPORTERING_PERIODE",
                                            innhold: {
                                                periode: {
                                                    fom: [2023, 6],
                                                    til: null,
                                                },
                                                inntektsrapportering: "SMÅBARNSTILLEGG",
                                                gjelderBarn: null,
                                                beløp: 10000,
                                                manueltRegistrert: false,
                                                valgt: true,
                                            },
                                        },
                                        {
                                            referanse: "sivilstand-person-bidragsmottaker-20220101",
                                            type: "SIVILSTAND_PERIODE",
                                            innhold: {
                                                periode: {
                                                    fom: [2022, 1],
                                                    til: null,
                                                },
                                                sivilstand: "BOR_ALENE_MED_BARN",
                                            },
                                        },
                                        {
                                            referanse: "Sjablon_Forskuddssats75ProsentBeløp_20210701",
                                            type: "SJABLON",
                                            innhold: {
                                                datoFom: "2021-07-01",
                                                datoTil: "2022-07-01",
                                                sjablonNavn: "Forskuddssats75ProsentBeløp",
                                                sjablonVerdi: 1280,
                                            },
                                        },
                                        {
                                            referanse: "Sjablon_ForskuddssatsBeløp_20210701",
                                            type: "SJABLON",
                                            innhold: {
                                                datoFom: "2021-07-01",
                                                datoTil: "2022-07-01",
                                                sjablonNavn: "ForskuddssatsBeløp",
                                                sjablonVerdi: 1710,
                                            },
                                        },
                                        {
                                            referanse: "Sjablon_MaksInntektForskuddMottakerMultiplikator_20030101",
                                            type: "SJABLON",
                                            innhold: {
                                                datoFom: "2003-01-01",
                                                datoTil: "2023-07-01",
                                                sjablonNavn: "MaksInntektForskuddMottakerMultiplikator",
                                                sjablonVerdi: 320,
                                            },
                                        },
                                        {
                                            referanse: "Sjablon_ØvreInntektsgrenseFulltForskuddBeløp_20210701",
                                            type: "SJABLON",
                                            innhold: {
                                                datoFom: "2021-07-01",
                                                datoTil: "2022-07-01",
                                                sjablonNavn: "ØvreInntektsgrenseFulltForskuddBeløp",
                                                sjablonVerdi: 305000,
                                            },
                                        },
                                        {
                                            referanse: "Sjablon_ØvreInntektsgrense75ProsentForskuddEnBeløp_20210701",
                                            type: "SJABLON",
                                            innhold: {
                                                datoFom: "2021-07-01",
                                                datoTil: "2022-07-01",
                                                sjablonNavn: "ØvreInntektsgrense75ProsentForskuddEnBeløp",
                                                sjablonVerdi: 476600,
                                            },
                                        },
                                        {
                                            referanse: "Sjablon_ØvreInntektsgrense75ProsentForskuddGSBeløp_20210701",
                                            type: "SJABLON",
                                            innhold: {
                                                datoFom: "2021-07-01",
                                                datoTil: "2022-07-01",
                                                sjablonNavn: "ØvreInntektsgrense75ProsentForskuddGSBeløp",
                                                sjablonVerdi: 366900,
                                            },
                                        },
                                        {
                                            referanse: "Sjablon_InntektsintervallForskuddBeløp_20210701",
                                            type: "SJABLON",
                                            innhold: {
                                                datoFom: "2021-07-01",
                                                datoTil: "2022-07-01",
                                                sjablonNavn: "InntektsintervallForskuddBeløp",
                                                sjablonVerdi: 68400,
                                            },
                                        },
                                        {
                                            referanse: "Sjablon_Forskuddssats75ProsentBeløp_20220701",
                                            type: "SJABLON",
                                            innhold: {
                                                datoFom: "2022-07-01",
                                                datoTil: "2023-07-01",
                                                sjablonNavn: "Forskuddssats75ProsentBeløp",
                                                sjablonVerdi: 1320,
                                            },
                                        },
                                        {
                                            referanse: "Sjablon_ForskuddssatsBeløp_20220701",
                                            type: "SJABLON",
                                            innhold: {
                                                datoFom: "2022-07-01",
                                                datoTil: "2023-07-01",
                                                sjablonNavn: "ForskuddssatsBeløp",
                                                sjablonVerdi: 1760,
                                            },
                                        },
                                        {
                                            referanse: "Sjablon_ØvreInntektsgrenseFulltForskuddBeløp_20220701",
                                            type: "SJABLON",
                                            innhold: {
                                                datoFom: "2022-07-01",
                                                datoTil: "2023-07-01",
                                                sjablonNavn: "ØvreInntektsgrenseFulltForskuddBeløp",
                                                sjablonVerdi: 312700,
                                            },
                                        },
                                        {
                                            referanse: "Sjablon_ØvreInntektsgrense75ProsentForskuddEnBeløp_20220701",
                                            type: "SJABLON",
                                            innhold: {
                                                datoFom: "2022-07-01",
                                                datoTil: "2023-07-01",
                                                sjablonNavn: "ØvreInntektsgrense75ProsentForskuddEnBeløp",
                                                sjablonVerdi: 488300,
                                            },
                                        },
                                        {
                                            referanse: "Sjablon_ØvreInntektsgrense75ProsentForskuddGSBeløp_20220701",
                                            type: "SJABLON",
                                            innhold: {
                                                datoFom: "2022-07-01",
                                                datoTil: "2023-07-01",
                                                sjablonNavn: "ØvreInntektsgrense75ProsentForskuddGSBeløp",
                                                sjablonVerdi: 375700,
                                            },
                                        },
                                        {
                                            referanse: "Sjablon_InntektsintervallForskuddBeløp_20220701",
                                            type: "SJABLON",
                                            innhold: {
                                                datoFom: "2022-07-01",
                                                datoTil: "2023-07-01",
                                                sjablonNavn: "InntektsintervallForskuddBeløp",
                                                sjablonVerdi: 68900,
                                            },
                                        },
                                        {
                                            referanse: "Sjablon_Forskuddssats75ProsentBeløp_20230701",
                                            type: "SJABLON",
                                            innhold: {
                                                datoFom: "2023-07-01",
                                                datoTil: "null",
                                                sjablonNavn: "Forskuddssats75ProsentBeløp",
                                                sjablonVerdi: 1410,
                                            },
                                        },
                                        {
                                            referanse: "Sjablon_ForskuddssatsBeløp_20230701",
                                            type: "SJABLON",
                                            innhold: {
                                                datoFom: "2023-07-01",
                                                datoTil: "null",
                                                sjablonNavn: "ForskuddssatsBeløp",
                                                sjablonVerdi: 1880,
                                            },
                                        },
                                        {
                                            referanse: "Sjablon_MaksInntektForskuddMottakerMultiplikator_20230701",
                                            type: "SJABLON",
                                            innhold: {
                                                datoFom: "2023-07-01",
                                                datoTil: "null",
                                                sjablonNavn: "MaksInntektForskuddMottakerMultiplikator",
                                                sjablonVerdi: 330,
                                            },
                                        },
                                        {
                                            referanse: "Sjablon_ØvreInntektsgrenseFulltForskuddBeløp_20230701",
                                            type: "SJABLON",
                                            innhold: {
                                                datoFom: "2023-07-01",
                                                datoTil: "null",
                                                sjablonNavn: "ØvreInntektsgrenseFulltForskuddBeløp",
                                                sjablonVerdi: 346200,
                                            },
                                        },
                                        {
                                            referanse: "Sjablon_ØvreInntektsgrense75ProsentForskuddEnBeløp_20230701",
                                            type: "SJABLON",
                                            innhold: {
                                                datoFom: "2023-07-01",
                                                datoTil: "null",
                                                sjablonNavn: "ØvreInntektsgrense75ProsentForskuddEnBeløp",
                                                sjablonVerdi: 532400,
                                            },
                                        },
                                        {
                                            referanse: "Sjablon_ØvreInntektsgrense75ProsentForskuddGSBeløp_20230701",
                                            type: "SJABLON",
                                            innhold: {
                                                datoFom: "2023-07-01",
                                                datoTil: "null",
                                                sjablonNavn: "ØvreInntektsgrense75ProsentForskuddGSBeløp",
                                                sjablonVerdi: 420600,
                                            },
                                        },
                                        {
                                            referanse: "Sjablon_InntektsintervallForskuddBeløp_20230701",
                                            type: "SJABLON",
                                            innhold: {
                                                datoFom: "2023-07-01",
                                                datoTil: "null",
                                                sjablonNavn: "InntektsintervallForskuddBeløp",
                                                sjablonVerdi: 74600,
                                            },
                                        },
                                    ],
                                },
                            },
                            {
                                barn: {
                                    ident: "07512150855",
                                    navn: generateName(),
                                    fødselsdato: "2005-06-23",
                                },
                                resultat: {
                                    beregnetForskuddPeriodeListe: [
                                        {
                                            periode: {
                                                fom: "2022-01",
                                                til: "2022-07",
                                            },
                                            resultat: {
                                                belop: 2.13e3,
                                                kode: "FORHØYET_FORSKUDD_11_ÅR_125_PROSENT",
                                                regel: "REGEL 5",
                                            },
                                            grunnlagsreferanseListe: [
                                                "Inntekt_LØNN_MANUELT_BEREGNET_person-bidragsmottaker_20220101",
                                                "Sjablon_Forskuddssats75ProsentBeløp_20210701",
                                                "Sjablon_ForskuddssatsBeløp_20210701",
                                                "Sjablon_InntektsintervallForskuddBeløp_20210701",
                                                "Sjablon_MaksInntektForskuddMottakerMultiplikator_20030101",
                                                "Sjablon_ØvreInntektsgrense75ProsentForskuddEnBeløp_20210701",
                                                "Sjablon_ØvreInntektsgrense75ProsentForskuddGSBeløp_20210701",
                                                "Sjablon_ØvreInntektsgrenseFulltForskuddBeløp_20210701",
                                                "bostatus-person-husstandsbarn-1618-20220101",
                                                "bostatus-person-husstandsbarn-1619-20220101",
                                                "bostatus-person-søkandsbarn-689-20220101",
                                                "person-søkandsbarn-689",
                                                "sivilstand-person-bidragsmottaker-20220101",
                                            ],
                                        },
                                        {
                                            periode: {
                                                fom: "2022-07",
                                                til: "2023-07",
                                            },
                                            resultat: {
                                                belop: 2.2e3,
                                                kode: "FORHØYET_FORSKUDD_11_ÅR_125_PROSENT",
                                                regel: "REGEL 5",
                                            },
                                            grunnlagsreferanseListe: [
                                                "Inntekt_LØNN_MANUELT_BEREGNET_person-bidragsmottaker_20220101",
                                                "Sjablon_Forskuddssats75ProsentBeløp_20220701",
                                                "Sjablon_ForskuddssatsBeløp_20220701",
                                                "Sjablon_InntektsintervallForskuddBeløp_20220701",
                                                "Sjablon_MaksInntektForskuddMottakerMultiplikator_20030101",
                                                "Sjablon_ØvreInntektsgrense75ProsentForskuddEnBeløp_20220701",
                                                "Sjablon_ØvreInntektsgrense75ProsentForskuddGSBeløp_20220701",
                                                "Sjablon_ØvreInntektsgrenseFulltForskuddBeløp_20220701",
                                                "bostatus-person-husstandsbarn-1618-20220101",
                                                "bostatus-person-husstandsbarn-1619-20220101",
                                                "bostatus-person-søkandsbarn-689-20220101",
                                                "person-søkandsbarn-689",
                                                "sivilstand-person-bidragsmottaker-20220101",
                                            ],
                                        },
                                        {
                                            periode: {
                                                fom: "2023-07",
                                            },
                                            resultat: {
                                                belop: 0,
                                                kode: "AVSLAG",
                                                regel: "REGEL 1",
                                            },
                                            grunnlagsreferanseListe: [
                                                "Inntekt_LØNN_MANUELT_BEREGNET_person-bidragsmottaker_20220101",
                                                "Sjablon_Forskuddssats75ProsentBeløp_20230701",
                                                "Sjablon_ForskuddssatsBeløp_20230701",
                                                "Sjablon_InntektsintervallForskuddBeløp_20230701",
                                                "Sjablon_MaksInntektForskuddMottakerMultiplikator_20230701",
                                                "Sjablon_ØvreInntektsgrense75ProsentForskuddEnBeløp_20230701",
                                                "Sjablon_ØvreInntektsgrense75ProsentForskuddGSBeløp_20230701",
                                                "Sjablon_ØvreInntektsgrenseFulltForskuddBeløp_20230701",
                                                "bostatus-person-husstandsbarn-1618-20220101",
                                                "bostatus-person-husstandsbarn-1619-20220101",
                                                "bostatus-person-søkandsbarn-689-20220101",
                                                "person-søkandsbarn-689",
                                                "sivilstand-person-bidragsmottaker-20220101",
                                            ],
                                        },
                                    ],
                                    grunnlagListe: [
                                        {
                                            referanse: "person-søkandsbarn-689",
                                            type: "PERSON",
                                            innhold: {
                                                ident: "23460587158",
                                                navn: "Salig Torn",
                                                fødselsdato: [2005, 6, 23],
                                            },
                                        },
                                        {
                                            referanse: "bostatus-person-søkandsbarn-689-20220101",
                                            type: "BOSTATUS_PERIODE",
                                            innhold: {
                                                periode: {
                                                    fom: [2022, 1],
                                                    til: null,
                                                },
                                                bostatus: "MED_FORELDER",
                                                manueltRegistrert: false,
                                            },
                                        },
                                        {
                                            referanse: "bostatus-person-husstandsbarn-1618-20220101",
                                            type: "BOSTATUS_PERIODE",
                                            innhold: {
                                                periode: {
                                                    fom: [2022, 1],
                                                    til: null,
                                                },
                                                bostatus: "MED_FORELDER",
                                                manueltRegistrert: false,
                                            },
                                        },
                                        {
                                            referanse: "bostatus-person-husstandsbarn-1619-20220101",
                                            type: "BOSTATUS_PERIODE",
                                            innhold: {
                                                periode: {
                                                    fom: [2022, 1],
                                                    til: null,
                                                },
                                                bostatus: "MED_FORELDER",
                                                manueltRegistrert: false,
                                            },
                                        },
                                        {
                                            referanse: "Inntekt_LØNN_MANUELT_BEREGNET_person-bidragsmottaker_20220101",
                                            type: "BEREGNING_INNTEKT_RAPPORTERING_PERIODE",
                                            innhold: {
                                                periode: {
                                                    fom: [2022, 1],
                                                    til: null,
                                                },
                                                inntektsrapportering: "LØNN_MANUELT_BEREGNET",
                                                gjelderBarn: null,
                                                beløp: 50000,
                                                manueltRegistrert: true,
                                                valgt: true,
                                            },
                                        },
                                        {
                                            referanse: "sivilstand-person-bidragsmottaker-20220101",
                                            type: "SIVILSTAND_PERIODE",
                                            innhold: {
                                                periode: {
                                                    fom: [2022, 1],
                                                    til: null,
                                                },
                                                sivilstand: "BOR_ALENE_MED_BARN",
                                            },
                                        },
                                        {
                                            referanse: "Sjablon_Forskuddssats75ProsentBeløp_20210701",
                                            type: "SJABLON",
                                            innhold: {
                                                datoFom: "2021-07-01",
                                                datoTil: "2022-07-01",
                                                sjablonNavn: "Forskuddssats75ProsentBeløp",
                                                sjablonVerdi: 1280,
                                            },
                                        },
                                        {
                                            referanse: "Sjablon_ForskuddssatsBeløp_20210701",
                                            type: "SJABLON",
                                            innhold: {
                                                datoFom: "2021-07-01",
                                                datoTil: "2022-07-01",
                                                sjablonNavn: "ForskuddssatsBeløp",
                                                sjablonVerdi: 1710,
                                            },
                                        },
                                        {
                                            referanse: "Sjablon_MaksInntektForskuddMottakerMultiplikator_20030101",
                                            type: "SJABLON",
                                            innhold: {
                                                datoFom: "2003-01-01",
                                                datoTil: "2023-07-01",
                                                sjablonNavn: "MaksInntektForskuddMottakerMultiplikator",
                                                sjablonVerdi: 320,
                                            },
                                        },
                                        {
                                            referanse: "Sjablon_ØvreInntektsgrenseFulltForskuddBeløp_20210701",
                                            type: "SJABLON",
                                            innhold: {
                                                datoFom: "2021-07-01",
                                                datoTil: "2022-07-01",
                                                sjablonNavn: "ØvreInntektsgrenseFulltForskuddBeløp",
                                                sjablonVerdi: 305000,
                                            },
                                        },
                                        {
                                            referanse: "Sjablon_ØvreInntektsgrense75ProsentForskuddEnBeløp_20210701",
                                            type: "SJABLON",
                                            innhold: {
                                                datoFom: "2021-07-01",
                                                datoTil: "2022-07-01",
                                                sjablonNavn: "ØvreInntektsgrense75ProsentForskuddEnBeløp",
                                                sjablonVerdi: 476600,
                                            },
                                        },
                                        {
                                            referanse: "Sjablon_ØvreInntektsgrense75ProsentForskuddGSBeløp_20210701",
                                            type: "SJABLON",
                                            innhold: {
                                                datoFom: "2021-07-01",
                                                datoTil: "2022-07-01",
                                                sjablonNavn: "ØvreInntektsgrense75ProsentForskuddGSBeløp",
                                                sjablonVerdi: 366900,
                                            },
                                        },
                                        {
                                            referanse: "Sjablon_InntektsintervallForskuddBeløp_20210701",
                                            type: "SJABLON",
                                            innhold: {
                                                datoFom: "2021-07-01",
                                                datoTil: "2022-07-01",
                                                sjablonNavn: "InntektsintervallForskuddBeløp",
                                                sjablonVerdi: 68400,
                                            },
                                        },
                                        {
                                            referanse: "Sjablon_Forskuddssats75ProsentBeløp_20220701",
                                            type: "SJABLON",
                                            innhold: {
                                                datoFom: "2022-07-01",
                                                datoTil: "2023-07-01",
                                                sjablonNavn: "Forskuddssats75ProsentBeløp",
                                                sjablonVerdi: 1320,
                                            },
                                        },
                                        {
                                            referanse: "Sjablon_ForskuddssatsBeløp_20220701",
                                            type: "SJABLON",
                                            innhold: {
                                                datoFom: "2022-07-01",
                                                datoTil: "2023-07-01",
                                                sjablonNavn: "ForskuddssatsBeløp",
                                                sjablonVerdi: 1760,
                                            },
                                        },
                                        {
                                            referanse: "Sjablon_ØvreInntektsgrenseFulltForskuddBeløp_20220701",
                                            type: "SJABLON",
                                            innhold: {
                                                datoFom: "2022-07-01",
                                                datoTil: "2023-07-01",
                                                sjablonNavn: "ØvreInntektsgrenseFulltForskuddBeløp",
                                                sjablonVerdi: 312700,
                                            },
                                        },
                                        {
                                            referanse: "Sjablon_ØvreInntektsgrense75ProsentForskuddEnBeløp_20220701",
                                            type: "SJABLON",
                                            innhold: {
                                                datoFom: "2022-07-01",
                                                datoTil: "2023-07-01",
                                                sjablonNavn: "ØvreInntektsgrense75ProsentForskuddEnBeløp",
                                                sjablonVerdi: 488300,
                                            },
                                        },
                                        {
                                            referanse: "Sjablon_ØvreInntektsgrense75ProsentForskuddGSBeløp_20220701",
                                            type: "SJABLON",
                                            innhold: {
                                                datoFom: "2022-07-01",
                                                datoTil: "2023-07-01",
                                                sjablonNavn: "ØvreInntektsgrense75ProsentForskuddGSBeløp",
                                                sjablonVerdi: 375700,
                                            },
                                        },
                                        {
                                            referanse: "Sjablon_InntektsintervallForskuddBeløp_20220701",
                                            type: "SJABLON",
                                            innhold: {
                                                datoFom: "2022-07-01",
                                                datoTil: "2023-07-01",
                                                sjablonNavn: "InntektsintervallForskuddBeløp",
                                                sjablonVerdi: 68900,
                                            },
                                        },
                                        {
                                            referanse: "Sjablon_Forskuddssats75ProsentBeløp_20230701",
                                            type: "SJABLON",
                                            innhold: {
                                                datoFom: "2023-07-01",
                                                datoTil: "null",
                                                sjablonNavn: "Forskuddssats75ProsentBeløp",
                                                sjablonVerdi: 1410,
                                            },
                                        },
                                        {
                                            referanse: "Sjablon_ForskuddssatsBeløp_20230701",
                                            type: "SJABLON",
                                            innhold: {
                                                datoFom: "2023-07-01",
                                                datoTil: "null",
                                                sjablonNavn: "ForskuddssatsBeløp",
                                                sjablonVerdi: 1880,
                                            },
                                        },
                                        {
                                            referanse: "Sjablon_MaksInntektForskuddMottakerMultiplikator_20230701",
                                            type: "SJABLON",
                                            innhold: {
                                                datoFom: "2023-07-01",
                                                datoTil: "null",
                                                sjablonNavn: "MaksInntektForskuddMottakerMultiplikator",
                                                sjablonVerdi: 330,
                                            },
                                        },
                                        {
                                            referanse: "Sjablon_ØvreInntektsgrenseFulltForskuddBeløp_20230701",
                                            type: "SJABLON",
                                            innhold: {
                                                datoFom: "2023-07-01",
                                                datoTil: "null",
                                                sjablonNavn: "ØvreInntektsgrenseFulltForskuddBeløp",
                                                sjablonVerdi: 346200,
                                            },
                                        },
                                        {
                                            referanse: "Sjablon_ØvreInntektsgrense75ProsentForskuddEnBeløp_20230701",
                                            type: "SJABLON",
                                            innhold: {
                                                datoFom: "2023-07-01",
                                                datoTil: "null",
                                                sjablonNavn: "ØvreInntektsgrense75ProsentForskuddEnBeløp",
                                                sjablonVerdi: 532400,
                                            },
                                        },
                                        {
                                            referanse: "Sjablon_ØvreInntektsgrense75ProsentForskuddGSBeløp_20230701",
                                            type: "SJABLON",
                                            innhold: {
                                                datoFom: "2023-07-01",
                                                datoTil: "null",
                                                sjablonNavn: "ØvreInntektsgrense75ProsentForskuddGSBeløp",
                                                sjablonVerdi: 420600,
                                            },
                                        },
                                        {
                                            referanse: "Sjablon_InntektsintervallForskuddBeløp_20230701",
                                            type: "SJABLON",
                                            innhold: {
                                                datoFom: "2023-07-01",
                                                datoTil: "null",
                                                sjablonNavn: "InntektsintervallForskuddBeløp",
                                                sjablonVerdi: 74600,
                                            },
                                        },
                                    ],
                                },
                            },
                        ],
                    })
                )
            );
        }),
    ];
}
