import { RolleDtoRolleType } from "../../api/BidragBehandlingApi";
import { HentGrunnlagspakkeDto } from "../../api/BidragGrunnlagApi";
import { HentSkattegrunnlagResponse } from "../../types/bidragGrunnlagTypes";
import { deductMonths, toISODateString } from "../../utils/date-utils";

const randomSalary = () => {
    const min = 2e5;
    const max = 1.5e6;

    return Math.round(min + Math.random() * (max - min));
};

export const createSkattegrunnlag = () =>
    [
        {
            grunnlag: [
                {
                    beloep: randomSalary().toString(),
                    tekniskNavn: "skattegrunnlag",
                },
            ],
            skatteoppgjoersdato: "2022",
        },
        {
            grunnlag: [
                {
                    beloep: randomSalary().toString(),
                    tekniskNavn: "loenn_og_trekk",
                },
            ],
            skatteoppgjoersdato: "2021",
        },
        {
            grunnlag: [
                {
                    beloep: randomSalary().toString(),
                    tekniskNavn: "skattegrunnlag",
                },
            ],
            skatteoppgjoersdato: "2020",
        },
    ] as HentSkattegrunnlagResponse[];

export const createHustandsmedlemmer = () => {
    const behandlingId = JSON.parse(localStorage.getItem(`behandlingId`));
    const behandling = JSON.parse(localStorage.getItem(`behandling-${behandlingId}`));
    return {
        husstandListe: [
            {
                gyldigFraOgMed: "2022-05-03",
                gyldigTilOgMed: "2022-12-31",
                adressenavn: "Frystikkalleen",
                husnummer: "1",
                husbokstav: "A",
                bruksenhetsnummer: "1234",
                postnummer: "0560",
                bydelsnummer: "1234",
                kommunenummer: "1234",
                matrikkelId: 0,
                husstandsmedlemListe: behandling.roller.map((rolle, index) => ({
                    gyldigFraOgMed: "2022-05-03",
                    gyldigTilOgMed: index % 2 === 1 ? "2022-10-31" : "2022-12-31",
                    personId: rolle.ident,
                    foedselsdato: "2020-05-03",
                })),
            },
            {
                gyldigFraOgMed: "2023-01-01",
                adressenavn: "Frystikkalleen",
                husnummer: "2",
                husbokstav: "B",
                bruksenhetsnummer: "1234",
                postnummer: "0560",
                bydelsnummer: "1234",
                kommunenummer: "1234",
                matrikkelId: 0,
                husstandsmedlemListe: behandling.roller.map((rolle, index) => ({
                    gyldigFraOgMed: index % 2 === 1 ? "2023-03-01" : "2023-01-01",
                    gyldigTilOgMed: index % 2 === 1 ? "2023-05-31" : null,
                    personId: rolle.ident,
                    foedselsdato: "2020-05-03",
                })),
            },
        ],
    };
};

export const createGrunnlagspakkeOppdaterData = (behandling) => {
    const bmIdent = behandling?.roller?.find((rolle) => rolle.rolleType === RolleDtoRolleType.BIDRAGSMOTTAKER).ident;
    const barn = behandling?.roller?.filter((rolle) => rolle.rolleType === RolleDtoRolleType.BARN);
    const periodeFra = toISODateString(deductMonths(new Date(), 36));
    const periodeTil = toISODateString(new Date());

    const skattegrunnlagBarnRequests = barn.map((b) => ({
        type: "SKATTEGRUNNLAG",
        personId: b.ident,
        periodeFra,
        periodeTil,
    }));
    const bmRequests = [
        "SKATTEGRUNNLAG",
        "UTVIDET_BARNETRYGD_OG_SMAABARNSTILLEGG",
        "BARNETILLEGG",
        "HUSSTANDSMEDLEMMER_OG_EGNE_BARN",
        "SIVILSTAND",
    ].map((type) => ({
        type: type,
        personId: bmIdent,
        periodeFra,
        periodeTil,
    }));

    return {
        gyldigTil: periodeTil,
        grunnlagRequestDtoListe: bmRequests.concat(skattegrunnlagBarnRequests),
    };
};

const barnHusstandsData = [
    {
        fodselsdato: "2020-06-05",
        borISammeHusstandDtoListe: [
            {
                periodeFra: null,
                periodeTil: "2020-06-05",
            },
            {
                periodeFra: "2020-06-06",
                periodeTil: null,
            },
        ],
    },
    {
        fodselsdato: "2018-06-05",
        borISammeHusstandDtoListe: [
            {
                periodeFra: "2018-06-05",
                periodeTil: null,
            },
            {
                periodeFra: null,
                periodeTil: "2020-03-01",
            },
            {
                periodeFra: "2020-04-01",
                periodeTil: "2021-07-07",
            },
            {
                periodeFra: "2022-01-01",
                periodeTil: null,
            },
        ],
    },
];

const getEgneBarnIHusstandenListe = (barn, bmIdent, today, barnHusstandsData) =>
    barn.map((b, i) => ({
        partPersonId: bmIdent,
        relatertPersonPersonId: b.ident,
        navn: "",
        fodselsdato: barnHusstandsData[i].fodselsdato,
        erBarnAvBmBp: true,
        aktiv: true,
        brukFra: today,
        brukTil: null,
        hentetTidspunkt: today,
        borISammeHusstandDtoListe: barnHusstandsData[i].borISammeHusstandDtoListe,
    }));

const createSkattegrunnlagListe = (bmIdent, barn, today) =>
    [
        {
            personId: bmIdent,
            periodeFra: "2022-01-01",
            periodeTil: "2022-12-31",
            aktiv: true,
            brukFra: today,
            brukTil: today,
            hentetTidspunkt: today,
            skattegrunnlagListe: [
                {
                    skattegrunnlagType: "ordinær",
                    inntektType: "LOENNSINNTEKT",
                    belop: 600000,
                },
                {
                    skattegrunnlagType: "ordinær",
                    inntektType: "YTELSE_FRA_OFFENTLIGE",
                    belop: 120000,
                },
            ],
        },
        {
            personId: bmIdent,
            periodeFra: "2021-01-01",
            periodeTil: "2021-12-31",
            aktiv: true,
            brukFra: today,
            brukTil: today,
            hentetTidspunkt: today,
            skattegrunnlagListe: [
                {
                    skattegrunnlagType: "ordinær",
                    inntektType: "LOENNSINNTEKT",
                    belop: 550000,
                },
            ],
        },
        {
            personId: bmIdent,
            periodeFra: "2020-01-01",
            periodeTil: "2020-12-31",
            aktiv: true,
            brukFra: today,
            brukTil: today,
            hentetTidspunkt: today,
            skattegrunnlagListe: [
                {
                    skattegrunnlagType: "ordinær",
                    inntektType: "LOENNSINNTEKT",
                    belop: 500000,
                },
            ],
        },
    ].concat(
        barn
            .map((b, i) => {
                if (i % 2) return null;
                else
                    return [
                        {
                            personId: b.ident,
                            periodeFra: "2022-01-01",
                            periodeTil: "2022-12-31",
                            aktiv: true,
                            brukFra: today,
                            brukTil: today,
                            hentetTidspunkt: today,
                            skattegrunnlagListe: [
                                {
                                    skattegrunnlagType: "ordinær",
                                    inntektType: "LOENNSINNTEKT",
                                    belop: 200000,
                                },
                            ],
                        },
                        {
                            personId: b.ident,
                            periodeFra: "2021-01-01",
                            periodeTil: "2021-12-31",
                            aktiv: true,
                            brukFra: today,
                            brukTil: today,
                            hentetTidspunkt: today,
                            skattegrunnlagListe: [
                                {
                                    skattegrunnlagType: "ordinær",
                                    inntektType: "LOENNSINNTEKT",
                                    belop: 180000,
                                },
                            ],
                        },
                        {
                            personId: b.ident,
                            periodeFra: "2020-01-01",
                            periodeTil: "2020-12-31",
                            aktiv: true,
                            brukFra: today,
                            brukTil: today,
                            hentetTidspunkt: today,
                            skattegrunnlagListe: [
                                {
                                    skattegrunnlagType: "ordinær",
                                    inntektType: "LOENNSINNTEKT",
                                    belop: 140000,
                                },
                            ],
                        },
                    ];
            })
            .filter((b) => b !== null)
            .flat()
    );

export const createGrunnlagspakkeData = (grunnlagspakkeId, behandling): HentGrunnlagspakkeDto => {
    const bmIdent = behandling?.roller?.find((rolle) => rolle.rolleType === RolleDtoRolleType.BIDRAGSMOTTAKER).ident;
    const barn = behandling?.roller?.filter((rolle) => rolle.rolleType === RolleDtoRolleType.BARN);
    const today = toISODateString(new Date());
    let year = new Date();
    let month = new Date().getMonth() + 1;
    const tolvMaaneder = [];
    let max = 12;

    for (let i = 0; i < max; i++) {
        const res = month - i;
        if (res === 0) {
            month = 12;
            i = 0;
            max = 12 - tolvMaaneder.length;
            year = new Date(year.getFullYear() - 1, 1, 1);
        }
        const m = res === 0 ? 12 : res;
        const fraDate = new Date(year.getFullYear(), m - 1, 1);
        const tilDate = new Date(year.getFullYear(), m, 0);

        tolvMaaneder.push({
            fra: toISODateString(fraDate),
            til: toISODateString(tilDate),
        });
    }

    return {
        grunnlagspakkeId,
        ainntektListe: tolvMaaneder.map((periode) => ({
            personId: bmIdent,
            periodeFra: periode.fra,
            periodeTil: periode.til,
            aktiv: true,
            brukFra: "",
            brukTil: "",
            hentetTidspunkt: today,
            ainntektspostListe: [
                {
                    utbetalingsperiode: "202303",
                    opptjeningsperiodeFra: periode.fra,
                    opptjeningsperiodeTil: periode.til,
                    opplysningspliktigId: "string",
                    virksomhetId: "string",
                    inntektType: "LOENNSINNTEKT",
                    fordelType: "string",
                    beskrivelse: "string",
                    belop: Math.round(20000 + Math.random() * (80000 - 20000)),
                    etterbetalingsperiodeFra: periode.fra,
                    etterbetalingsperiodeTil: periode.til,
                },
                {
                    utbetalingsperiode: "202303",
                    opptjeningsperiodeFra: periode.fra,
                    opptjeningsperiodeTil: periode.til,
                    opplysningspliktigId: "string",
                    virksomhetId: "string",
                    inntektType: "NAERINGSINNTEKT",
                    fordelType: "string",
                    beskrivelse: "string",
                    belop: Math.round(20000 + Math.random() * (80000 - 20000)),
                    etterbetalingsperiodeFra: periode.fra,
                    etterbetalingsperiodeTil: periode.til,
                },
            ],
        })),
        skattegrunnlagListe: createSkattegrunnlagListe(bmIdent, barn, today),
        ubstListe: [],
        barnetilleggListe: [],
        kontantstotteListe: [
            {
                partPersonId: "string",
                barnPersonId: "string",
                periodeFra: "2023-06-06",
                periodeTil: "2023-06-06",
                aktiv: true,
                brukFra: "2023-06-06T11:42:13.955Z",
                brukTil: "2023-06-06T11:42:13.955Z",
                belop: 0,
                hentetTidspunkt: "2023-06-06T11:42:13.955Z",
            },
        ],
        husstandmedlemListe: [
            {
                partPersonId: "string",
                relatertPersonPersonId: "string",
                navn: "string",
                fodselsdato: "2023-06-06",
                erBarnAvBmBp: true,
                aktiv: true,
                brukFra: "2023-06-06T11:42:13.956Z",
                brukTil: "2023-06-06T11:42:13.956Z",
                hentetTidspunkt: "2023-06-06T11:42:13.956Z",
                borISammeHusstandDtoListe: [
                    {
                        periodeFra: "2023-06-06",
                        periodeTil: "2023-06-06",
                    },
                ],
            },
        ],
        husstandmedlemmerOgEgneBarnListe: getEgneBarnIHusstandenListe(barn, bmIdent, today, barnHusstandsData),
        egneBarnIHusstandenListe: getEgneBarnIHusstandenListe(barn, bmIdent, today, barnHusstandsData),
        sivilstandListe: [
            {
                aktiv: true,
                brukFra: "2023-06-12T09:49:13.96137",
                brukTil: null,
                hentetTidspunkt: "2023-06-12T09:49:13.96137",
                periodeFra: "1977-08-02",
                periodeTil: null,
                personId: "02487731725",
                // TODO remove that once grunnlag swagger types are fixed
                // @ts-ignore
                sivilstand: "UGIFT",
            },
        ],
        barnetilsynListe: [
            {
                partPersonId: "string",
                barnPersonId: "string",
                periodeFra: "2023-06-06",
                periodeTil: "2023-06-06",
                aktiv: true,
                brukFra: "2023-06-06T11:42:13.956Z",
                brukTil: "2023-06-06T11:42:13.956Z",
                belop: 0,
                tilsynstype: "HELTID",
                skolealder: "OVER",
                hentetTidspunkt: "2023-06-06T11:42:13.956Z",
            },
        ],
        overgangsstonadListe: [
            {
                partPersonId: "string",
                periodeFra: "2023-06-06",
                periodeTil: "2023-06-06",
                aktiv: true,
                brukFra: "2023-06-06T11:42:13.956Z",
                brukTil: "2023-06-06T11:42:13.956Z",
                belop: 0,
                hentetTidspunkt: "2023-06-06T11:42:13.956Z",
            },
        ],
    };
};
