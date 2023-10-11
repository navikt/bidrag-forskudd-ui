import { expect } from "chai";
import { describe } from "mocha";

import { BoStatusType } from "../../api/BidragBehandlingApi";
import {
    checkOverlappingPeriods,
    compareOpplysninger,
    fillInPeriodGaps,
    getBarnPerioderFromHusstandsListe,
    mapHusstandsMedlemmerToBarn,
} from "../../components/forms/helpers/boforholdFormHelpers";
import { toISODateString } from "../../utils/date-utils";

describe("BoforholdFormHelpers", () => {
    it("should fill in a period with status IKKE IKKE_REGISTRERT_PA_ADRESSE if there is a gap between 2 periods in folkeregistre", () => {
        const egneBarnIHusstand = {
            partPersonId: "21470262629",
            relatertPersonPersonId: "07512150855",
            navn: "",
            fodselsdato: "2018-06-05",
            erBarnAvBmBp: true,
            aktiv: true,
            brukFra: "2023-10-03",
            brukTil: null,
            hentetTidspunkt: "2023-10-03",
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
                    periodeFra: "2020-03-02",
                    periodeTil: "2021-07-07",
                },
                {
                    periodeFra: "2022-01-01",
                    periodeTil: null,
                },
            ],
        };
        const expectedResult = [
            {
                fraDato: new Date("2018-06-05"),
                tilDato: new Date("2021-07-07"),
                boStatus: "REGISTRERT_PA_ADRESSE",
            },
            {
                fraDato: new Date("2021-07-08"),
                tilDato: new Date("2021-12-31"),
                boStatus: "IKKE_REGISTRERT_PA_ADRESSE",
            },
            {
                fraDato: new Date("2022-01-01"),
                tilDato: null,
                boStatus: "REGISTRERT_PA_ADRESSE",
            },
        ];
        const husstandsOpplysningerFraFolkRegistre = fillInPeriodGaps(egneBarnIHusstand);
        expect(husstandsOpplysningerFraFolkRegistre.length).equals(expectedResult.length);
        husstandsOpplysningerFraFolkRegistre.forEach((husstandsOpplysning, i) => {
            expect(husstandsOpplysning.fraDato?.toDateString()).equals(expectedResult[i].fraDato?.toDateString());
            expect(husstandsOpplysning.tilDato?.toDateString()).equals(expectedResult[i].tilDato?.toDateString());
            expect(husstandsOpplysning.boStatus).equals(expectedResult[i].boStatus);
        });
    });

    it("should create correct hustands periods from grunnlag husstandmedlemmerOgEgneBarnListe", () => {
        const husstandmedlemmerOgEgneBarnListe = [
            {
                partPersonId: "20468520282",
                relatertPersonPersonId: "05421652440",
                navn: "HEVNGJERRIG ALT",
                fodselsdato: "2016-02-05",
                erBarnAvBmBp: false,
                aktiv: true,
                brukFra: "2023-10-10T13:53:14.447015",
                brukTil: null,
                hentetTidspunkt: "2023-10-10T13:53:14.447015",
                borISammeHusstandDtoListe: [
                    {
                        periodeFra: "2016-02-05",
                        periodeTil: null,
                    },
                ],
            },
            {
                partPersonId: "20468520282",
                relatertPersonPersonId: "05492256961",
                navn: "AKTVERDIG ODDE",
                fodselsdato: "2022-09-05",
                erBarnAvBmBp: true,
                aktiv: true,
                brukFra: "2023-10-10T13:53:14.447015",
                brukTil: null,
                hentetTidspunkt: "2023-10-10T13:53:14.447015",
                borISammeHusstandDtoListe: [
                    {
                        periodeFra: "2022-09-05",
                        periodeTil: null,
                    },
                ],
            },
            {
                partPersonId: "20468520282",
                relatertPersonPersonId: "08427635458",
                navn: "ALMINNELIG GÅTE",
                fodselsdato: "1976-02-08",
                erBarnAvBmBp: false,
                aktiv: true,
                brukFra: "2023-10-10T13:53:14.447015",
                brukTil: null,
                hentetTidspunkt: "2023-10-10T13:53:14.447015",
                borISammeHusstandDtoListe: [
                    {
                        periodeFra: "2016-02-05",
                        periodeTil: null,
                    },
                ],
            },
            {
                partPersonId: "20468520282",
                relatertPersonPersonId: "10411473223",
                navn: "EKSTRA FAMILIEBARNEHAGE",
                fodselsdato: "2014-01-10",
                erBarnAvBmBp: true,
                aktiv: true,
                brukFra: "2023-10-10T13:53:14.447015",
                brukTil: null,
                hentetTidspunkt: "2023-10-10T13:53:14.447015",
                borISammeHusstandDtoListe: [
                    {
                        periodeFra: "2022-09-05",
                        periodeTil: null,
                    },
                ],
            },
        ];
        const husstandsOpplysningerFraFolkRegistre = mapHusstandsMedlemmerToBarn(husstandmedlemmerOgEgneBarnListe);
        expect(husstandsOpplysningerFraFolkRegistre.length).equals(2);
        expect(husstandsOpplysningerFraFolkRegistre[0].navn).equals("AKTVERDIG ODDE");
        expect(husstandsOpplysningerFraFolkRegistre[0].perioder.length).equals(1);
        expect(toISODateString(husstandsOpplysningerFraFolkRegistre[0].perioder[0].fraDato)).equals("2022-09-05");
        expect(husstandsOpplysningerFraFolkRegistre[0].perioder[0].tilDato).equals(null);
        expect(husstandsOpplysningerFraFolkRegistre[0].perioder[0].boStatus).equals("REGISTRERT_PA_ADRESSE");
        expect(husstandsOpplysningerFraFolkRegistre[1].navn).equals("EKSTRA FAMILIEBARNEHAGE");
        expect(husstandsOpplysningerFraFolkRegistre[1].perioder.length).equals(2);
        expect(toISODateString(husstandsOpplysningerFraFolkRegistre[1].perioder[0].fraDato)).equals("2014-01-10");
        expect(toISODateString(husstandsOpplysningerFraFolkRegistre[1].perioder[0].tilDato)).equals("2022-09-04");
        expect(husstandsOpplysningerFraFolkRegistre[1].perioder[0].boStatus).equals("IKKE_REGISTRERT_PA_ADRESSE");
        expect(toISODateString(husstandsOpplysningerFraFolkRegistre[1].perioder[1].fraDato)).equals("2022-09-05");
        expect(husstandsOpplysningerFraFolkRegistre[1].perioder[1].tilDato).equals(null);
        expect(husstandsOpplysningerFraFolkRegistre[1].perioder[1].boStatus).equals("REGISTRERT_PA_ADRESSE");
    });

    it("should create hustands periods from grunnlag husstandmedlemmerOgEgneBarnListe", () => {
        const husstandmedlemmerOgEgneBarnListe = [
            {
                partPersonId: "02038417846",
                relatertPersonPersonId: "02110180716",
                navn: "ALI RAHMAN RAHMAN",
                fodselsdato: "2001-11-02",
                erBarnAvBmBp: true,
                aktiv: true,
                brukFra: "2023-10-10T15:16:11.417149",
                brukTil: null,
                hentetTidspunkt: "2023-10-10T15:16:11.417149",
                borISammeHusstandDtoListe: [
                    {
                        periodeFra: "2016-12-09",
                        periodeTil: "2023-08-14",
                    },
                ],
            },
        ];

        const husstandsOpplysningerFraFolkRegistre = mapHusstandsMedlemmerToBarn(husstandmedlemmerOgEgneBarnListe);
        expect(husstandsOpplysningerFraFolkRegistre[0].perioder.length).equals(3);
        expect(toISODateString(husstandsOpplysningerFraFolkRegistre[0].perioder[0].fraDato)).equals("2001-11-02");
        expect(toISODateString(husstandsOpplysningerFraFolkRegistre[0].perioder[0].tilDato)).equals("2016-12-08");
        expect(husstandsOpplysningerFraFolkRegistre[0].perioder[0].boStatus).equals("IKKE_REGISTRERT_PA_ADRESSE");
        expect(toISODateString(husstandsOpplysningerFraFolkRegistre[0].perioder[1].fraDato)).equals("2016-12-09");
        expect(toISODateString(husstandsOpplysningerFraFolkRegistre[0].perioder[1].tilDato)).equals("2023-08-14");
        expect(husstandsOpplysningerFraFolkRegistre[0].perioder[1].boStatus).equals("REGISTRERT_PA_ADRESSE");
        expect(toISODateString(husstandsOpplysningerFraFolkRegistre[0].perioder[2].fraDato)).equals("2023-08-15");
        expect(husstandsOpplysningerFraFolkRegistre[0].perioder[2].tilDato).equals(null);
        expect(husstandsOpplysningerFraFolkRegistre[0].perioder[2].boStatus).equals("IKKE_REGISTRERT_PA_ADRESSE");
    });

    it("getBarnPerioderFromHusstandsListe should create initial values from grunnlag husstandmedlemmerOgEgneBarnListe", () => {
        const husstandmedlemmerOgEgneBarnListe = [
            {
                partPersonId: "02038417846",
                relatertPersonPersonId: "02110180716",
                navn: "ALI RAHMAN RAHMAN",
                fodselsdato: "2001-11-02",
                erBarnAvBmBp: true,
                aktiv: true,
                brukFra: "2023-10-10T15:16:11.417149",
                brukTil: null,
                hentetTidspunkt: "2023-10-10T15:16:11.417149",
                borISammeHusstandDtoListe: [
                    {
                        periodeFra: "2016-12-09",
                        periodeTil: "2023-08-14",
                    },
                ],
            },
        ];

        const datoFom = new Date("2023-06-01");
        const husstandsOpplysningerFraFolkRegistre = mapHusstandsMedlemmerToBarn(husstandmedlemmerOgEgneBarnListe);
        const result = getBarnPerioderFromHusstandsListe(husstandsOpplysningerFraFolkRegistre, datoFom);
        expect(result[0].perioder.length).equals(2);
        expect(result[0].perioder[0].datoFom).equals("2023-06-01");
        expect(result[0].perioder[0].datoTom).equals("2023-08-31");
        expect(result[0].perioder[0].boStatus).equals("REGISTRERT_PA_ADRESSE");
        expect(result[0].perioder[1].datoFom).equals("2023-09-01");
        expect(result[0].perioder[1].datoTom).equals(null);
        expect(result[0].perioder[1].boStatus).equals("IKKE_REGISTRERT_PA_ADRESSE");
    });

    it("should create husstands periods from the data from folkeregistre", () => {
        const datoFom = new Date("2020-06-01");
        const husstandsOpplysningerFraFolkRegistre = [
            {
                ident: "03522150877",
                navn: "",
                perioder: [
                    {
                        fraDato: null,
                        tilDato: null,
                        boStatus: BoStatusType.REGISTRERT_PA_ADRESSE,
                    },
                ],
            },
            {
                ident: "07512150855",
                navn: "",
                perioder: [
                    {
                        fraDato: new Date("2018-06-05"),
                        tilDato: new Date("2020-03-01"),
                        boStatus: BoStatusType.REGISTRERT_PA_ADRESSE,
                    },
                    {
                        fraDato: new Date("2020-03-02"),
                        tilDato: new Date("2020-03-31"),
                        boStatus: BoStatusType.IKKE_REGISTRERT_PA_ADRESSE,
                    },
                    {
                        fraDato: new Date("2020-04-01"),
                        tilDato: new Date("2021-07-07"),
                        boStatus: BoStatusType.REGISTRERT_PA_ADRESSE,
                    },
                    {
                        fraDato: new Date("2021-07-08"),
                        tilDato: new Date("2021-12-31"),
                        boStatus: BoStatusType.IKKE_REGISTRERT_PA_ADRESSE,
                    },
                    {
                        fraDato: new Date("2022-01-01"),
                        tilDato: null,
                        boStatus: BoStatusType.REGISTRERT_PA_ADRESSE,
                    },
                ],
            },
        ];
        const expectedResult = [
            {
                ident: "03522150877",
                navn: "",
                perioder: [
                    {
                        datoFom: "2020-06-01",
                        datoTom: null,
                        boStatus: BoStatusType.REGISTRERT_PA_ADRESSE,
                        kilde: "offentlig",
                    },
                ],
                medISaken: true,
            },
            {
                ident: "07512150855",
                navn: "",
                perioder: [
                    {
                        datoFom: "2020-06-01",
                        datoTom: "2021-07-31",
                        boStatus: BoStatusType.REGISTRERT_PA_ADRESSE,
                        kilde: "offentlig",
                    },
                    {
                        datoFom: "2021-08-01",
                        datoTom: "2021-12-31",
                        boStatus: BoStatusType.IKKE_REGISTRERT_PA_ADRESSE,
                        kilde: "offentlig",
                    },
                    {
                        datoFom: "2022-01-01",
                        datoTom: null,
                        boStatus: BoStatusType.REGISTRERT_PA_ADRESSE,
                        kilde: "offentlig",
                    },
                ],
                medISaken: true,
            },
        ];
        const result = getBarnPerioderFromHusstandsListe(husstandsOpplysningerFraFolkRegistre, datoFom);
        result.forEach((r, i) => {
            r.perioder.forEach((periode, j) => {
                expect(periode.datoFom).equals(expectedResult[i].perioder[j].datoFom);
                expect(periode.datoTom).equals(expectedResult[i].perioder[j].datoTom);
                expect(periode.boStatus).equals(expectedResult[i].perioder[j].boStatus);
            });
        });
    });

    it("should return an array with overlapping periods if there are overlaps", () => {
        const testPeriods = [
            { datoFom: "2022-01-01", datoTom: "2022-03-31" },
            { datoFom: "2022-03-01", datoTom: "2022-04-30" },
            { datoFom: "2022-04-01", datoTom: "2022-07-31" },
        ];
        const expectedResult = [
            ["2022-03-31", "2022-03-01"],
            ["2022-04-30", "2022-04-01"],
        ];
        const overlappingPeriods = checkOverlappingPeriods(testPeriods);
        expect(overlappingPeriods.length).equals(expectedResult.length);
        overlappingPeriods.forEach((periods, i) => {
            expect(periods[0]).equals(expectedResult[i][0]);
            expect(periods[1]).equals(expectedResult[i][1]);
        });
    });

    it("should return an array with overlapping periods if one of the periods that is not last has null as datoTom", () => {
        const testPeriods = [
            { datoFom: "2022-01-01", datoTom: "2022-03-31" },
            { datoFom: "2022-04-01", datoTom: null },
            { datoFom: "2022-05-01", datoTom: "2022-07-01" },
        ];
        const expectedResult = [["null", "2022-05-01"]];
        const overlappingPeriods = checkOverlappingPeriods(testPeriods);
        expect(overlappingPeriods.length).equals(expectedResult.length);
        overlappingPeriods.forEach((periods, i) => {
            expect(periods[0]).equals(expectedResult[i][0]);
            expect(periods[1]).equals(expectedResult[i][1]);
        });
    });

    it("should return an empty array with overlapping periods if the last period that has null as datoTom", () => {
        const testPeriods = [
            { datoFom: "2022-01-01", datoTom: "2022-03-31" },
            { datoFom: "2022-04-01", datoTom: "2022-04-30" },
            { datoFom: "2022-05-01", datoTom: null },
        ];
        const overlappingPeriods = checkOverlappingPeriods(testPeriods);
        expect(overlappingPeriods.length).equals(0);
    });

    it("compareOpplysninger should return empty array when there are no changes in the latest opplysninger", () => {
        const savedOpplysninger = {
            husstand: [
                {
                    ident: "05492256961",
                    navn: "AKTVERDIG ODDE",
                    perioder: [
                        {
                            fraDato: "2022-09-05T00:00:00.000Z",
                            tilDato: null,
                            boStatus: BoStatusType.REGISTRERT_PA_ADRESSE,
                        },
                    ],
                },
                {
                    ident: "10411473223",
                    navn: "EKSTRA FAMILIEBARNEHAGE",
                    perioder: [
                        {
                            fraDato: "2014-01-10T00:00:00.000Z",
                            tilDato: "2022-09-04T00:00:00.000Z",
                            boStatus: BoStatusType.IKKE_REGISTRERT_PA_ADRESSE,
                        },
                        {
                            fraDato: "2022-09-05T00:00:00.000Z",
                            tilDato: null,
                            boStatus: BoStatusType.REGISTRERT_PA_ADRESSE,
                        },
                    ],
                },
            ],
            sivilstand: [
                {
                    personId: "20468520282",
                    periodeFra: "1985-06-20",
                    periodeTil: "2023-07-04",
                    sivilstand: "UGIFT",
                    aktiv: true,
                    brukFra: "2023-10-11T09:43:03.38538",
                    brukTil: null,
                    hentetTidspunkt: "2023-10-11T09:43:03.38538",
                },
                {
                    personId: "20468520282",
                    periodeFra: "2023-07-04",
                    periodeTil: null,
                    sivilstand: "UGIFT",
                    aktiv: true,
                    brukFra: "2023-10-11T09:43:03.38538",
                    brukTil: null,
                    hentetTidspunkt: "2023-10-11T09:43:03.38538",
                },
            ],
        };
        const latestOpplysninger = {
            husstand: [
                {
                    ident: "05492256961",
                    navn: "AKTVERDIG ODDE",
                    perioder: [
                        {
                            fraDato: new Date("2022-09-05T00:00:00.000Z"),
                            tilDato: null,
                            boStatus: BoStatusType.REGISTRERT_PA_ADRESSE,
                        },
                    ],
                },
                {
                    ident: "10411473223",
                    navn: "EKSTRA FAMILIEBARNEHAGE",
                    perioder: [
                        {
                            fraDato: new Date("2014-01-10T00:00:00.000Z"),
                            tilDato: new Date("2022-09-04T00:00:00.000Z"),
                            boStatus: BoStatusType.IKKE_REGISTRERT_PA_ADRESSE,
                        },
                        {
                            fraDato: new Date("2022-09-05T00:00:00.000Z"),
                            tilDato: null,
                            boStatus: BoStatusType.REGISTRERT_PA_ADRESSE,
                        },
                    ],
                },
            ],
            sivilstand: [
                {
                    personId: "20468520282",
                    periodeFra: "1985-06-20",
                    periodeTil: "2023-07-04",
                    sivilstand: "UGIFT" as const,
                    aktiv: true,
                    brukFra: "2023-10-11T10:16:45.6057",
                    brukTil: null,
                    hentetTidspunkt: "2023-10-11T10:16:45.6057",
                },
                {
                    personId: "20468520282",
                    periodeFra: "2023-07-04",
                    periodeTil: null,
                    sivilstand: "UGIFT" as const,
                    aktiv: true,
                    brukFra: "2023-10-11T10:16:45.6057",
                    brukTil: null,
                    hentetTidspunkt: "2023-10-11T10:16:45.6057",
                },
            ],
        };
        const result = compareOpplysninger(savedOpplysninger, latestOpplysninger);
        expect(result.length).equals(0);
    });

    it("compareOpplysninger should return an array with changes for husstand per child when there are changes in the latest opplysninger", () => {
        const savedOpplysninger = {
            husstand: [
                {
                    ident: "05492256961",
                    navn: "AKTVERDIG ODDE",
                    perioder: [
                        {
                            fraDato: "2022-09-05T00:00:00.000Z",
                            tilDato: null,
                            boStatus: BoStatusType.REGISTRERT_PA_ADRESSE,
                        },
                    ],
                },
                {
                    ident: "10411473223",
                    navn: "EKSTRA FAMILIEBARNEHAGE",
                    perioder: [
                        {
                            fraDato: "2014-01-10T00:00:00.000Z",
                            tilDato: "2022-09-04T00:00:00.000Z",
                            boStatus: BoStatusType.IKKE_REGISTRERT_PA_ADRESSE,
                        },
                        {
                            fraDato: "2022-09-05T00:00:00.000Z",
                            tilDato: null,
                            boStatus: BoStatusType.REGISTRERT_PA_ADRESSE,
                        },
                    ],
                },
            ],
            sivilstand: [
                {
                    personId: "20468520282",
                    periodeFra: "1985-06-20",
                    periodeTil: "2023-07-04",
                    sivilstand: "UGIFT",
                    aktiv: true,
                    brukFra: "2023-10-11T09:43:03.38538",
                    brukTil: null,
                    hentetTidspunkt: "2023-10-11T09:43:03.38538",
                },
                {
                    personId: "20468520282",
                    periodeFra: "2023-07-04",
                    periodeTil: null,
                    sivilstand: "UGIFT",
                    aktiv: true,
                    brukFra: "2023-10-11T09:43:03.38538",
                    brukTil: null,
                    hentetTidspunkt: "2023-10-11T09:43:03.38538",
                },
            ],
        };
        const latestOpplysninger = {
            husstand: [
                {
                    ident: "05492256961",
                    navn: "AKTVERDIG ODDE",
                    perioder: [
                        {
                            fraDato: new Date("2022-09-05T00:00:00.000Z"),
                            tilDato: new Date("2022-10-07T00:00:00.000Z"),
                            boStatus: BoStatusType.IKKE_REGISTRERT_PA_ADRESSE,
                        },
                        {
                            fraDato: new Date("2022-10-08T00:00:00.000Z"),
                            tilDato: null,
                            boStatus: BoStatusType.REGISTRERT_PA_ADRESSE,
                        },
                    ],
                },
                {
                    ident: "10411473223",
                    navn: "EKSTRA FAMILIEBARNEHAGE",
                    perioder: [
                        {
                            fraDato: new Date("2014-01-10T00:00:00.000Z"),
                            tilDato: new Date("2022-09-04T00:00:00.000Z"),
                            boStatus: BoStatusType.IKKE_REGISTRERT_PA_ADRESSE,
                        },
                        {
                            fraDato: new Date("2022-09-05T00:00:00.000Z"),
                            tilDato: null,
                            boStatus: BoStatusType.REGISTRERT_PA_ADRESSE,
                        },
                    ],
                },
            ],
            sivilstand: [
                {
                    personId: "20468520282",
                    periodeFra: "1985-06-20",
                    periodeTil: "2023-07-04",
                    sivilstand: "UGIFT" as const,
                    aktiv: true,
                    brukFra: "2023-10-11T10:16:45.6057",
                    brukTil: null,
                    hentetTidspunkt: "2023-10-11T10:16:45.6057",
                },
                {
                    personId: "20468520282",
                    periodeFra: "2023-07-04",
                    periodeTil: null,
                    sivilstand: "UGIFT" as const,
                    aktiv: true,
                    brukFra: "2023-10-11T10:16:45.6057",
                    brukTil: null,
                    hentetTidspunkt: "2023-10-11T10:16:45.6057",
                },
            ],
        };
        const result = compareOpplysninger(savedOpplysninger, latestOpplysninger);
        expect(result.length).equals(3);
        expect(result[0]).equals("En eller flere perioder har blitt lagt til barn med ident - 05492256961");
        expect(result[1]).equals(
            "Datoene for en eller flere perioder har blitt endret for barn med ident - 05492256961"
        );
        expect(result[2]).equals(
            "Bostatus for en eller flere perioder har blitt endret for barn med ident - 05492256961"
        );
    });
});
