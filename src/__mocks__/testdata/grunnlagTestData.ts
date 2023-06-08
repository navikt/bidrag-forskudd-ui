import { RolleType } from "../../api/BidragBehandlingApi";
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
    const bmIdent = behandling?.roller?.find((rolle) => rolle.rolleType === RolleType.BIDRAGS_MOTTAKER).ident;
    const barn = behandling?.roller?.filter((rolle) => rolle.rolleType === RolleType.BARN);
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
        "HUSSTANDSMEDLEMMER",
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
                periodeFra: "2020-06-05",
                periodeTil: toISODateString(new Date()),
            },
        ],
    },
    {
        fodselsdato: "2018-06-05",
        borISammeHusstandDtoListe: [
            {
                periodeFra: "2018-06-05",
                periodeTil: "2019-04-04",
            },
            {
                periodeFra: "2020-03-01",
                periodeTil: "2021-07-07",
            },
            {
                periodeFra: "2022-01-01",
                periodeTil: toISODateString(new Date()),
            },
        ],
    },
];

export const createGrunnlagspakkeData = (grunnlagspakkeId, behandling): HentGrunnlagspakkeDto => {
    const bmIdent = behandling?.roller?.find((rolle) => rolle.rolleType === RolleType.BIDRAGS_MOTTAKER).ident;
    const barn = behandling?.roller?.filter((rolle) => rolle.rolleType === RolleType.BARN);
    const periodeFra = toISODateString(deductMonths(new Date(), 36));
    const periodeTil = toISODateString(new Date());

    return {
        grunnlagspakkeId,
        ainntektListe: [
            {
                personId: bmIdent,
                periodeFra,
                periodeTil,
                aktiv: true,
                brukFra: periodeTil,
                brukTil: periodeTil,
                hentetTidspunkt: periodeTil,
                ainntektspostListe: [
                    {
                        utbetalingsperiode: "202303",
                        opptjeningsperiodeFra: "2023-02-05",
                        opptjeningsperiodeTil: "2023-03-05",
                        opplysningspliktigId: "string",
                        virksomhetId: "string",
                        inntektType: "Lonnsinntekt",
                        fordelType: "string",
                        beskrivelse: "string",
                        belop: 50000,
                        etterbetalingsperiodeFra: "2023-02-05",
                        etterbetalingsperiodeTil: "2023-03-05",
                    },
                ],
            },
        ],
        skattegrunnlagListe: [
            {
                personId: bmIdent,
                periodeFra,
                periodeTil,
                aktiv: true,
                brukFra: periodeTil,
                brukTil: periodeTil,
                hentetTidspunkt: periodeTil,
                skattegrunnlagListe: [
                    {
                        skattegrunnlagType: "ordinær",
                        inntektType: "Lonnsinntekt",
                        belop: 600000,
                    },
                ],
            },
        ].concat(
            barn.map((b) => ({
                personId: b.ident,
                periodeFra,
                periodeTil,
                aktiv: true,
                brukFra: periodeTil,
                brukTil: periodeTil,
                hentetTidspunkt: periodeTil,
                skattegrunnlagListe: [
                    {
                        skattegrunnlagType: "ordinær",
                        inntektType: "Lonnsinntekt",
                        belop: 200000,
                    },
                ],
            }))
        ),
        ubstListe: [
            {
                personId: "string",
                type: "string",
                periodeFra: "2023-06-05",
                periodeTil: "2023-06-05",
                aktiv: true,
                brukFra: "2023-06-05T09:12:12.850Z",
                brukTil: "2023-06-05T09:12:12.850Z",
                belop: 0,
                manueltBeregnet: true,
                hentetTidspunkt: "2023-06-05T09:12:12.850Z",
            },
        ],
        barnetilleggListe: [
            {
                partPersonId: "string",
                barnPersonId: "string",
                barnetilleggType: "string",
                periodeFra: "2023-06-05",
                periodeTil: "2023-06-05",
                aktiv: true,
                brukFra: "2023-06-05T06:43:12.451Z",
                brukTil: "2023-06-05T06:43:12.451Z",
                belopBrutto: 0,
                barnType: "string",
                hentetTidspunkt: "2023-06-05T06:43:12.451Z",
            },
        ],
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
        husstandmedlemmerOgEgneBarnListe: [
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
        egneBarnIHusstandenListe: barn.map((b, i) => ({
            partPersonId: bmIdent,
            relatertPersonPersonId: b.ident,
            navn: "",
            fodselsdato: barnHusstandsData[i].fodselsdato,
            erBarnAvBmBp: true,
            aktiv: true,
            brukFra: periodeTil,
            brukTil: null,
            hentetTidspunkt: periodeTil,
            borISammeHusstandDtoListe: barnHusstandsData[i].borISammeHusstandDtoListe,
        })),
        sivilstandListe: [
            {
                sivilstand: [
                    // @ts-ignore
                    {
                        type: "GIFT",
                        gyldigFraOgMed: "2023-06-05",
                        bekreftelsesdato: "2023-06-05",
                    },
                ],
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
