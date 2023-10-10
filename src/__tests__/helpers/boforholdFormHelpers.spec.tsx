import { expect } from "chai";
import { describe } from "mocha";

import { BoStatusType } from "../../api/BidragBehandlingApi";
import {
    checkOverlappingPeriods,
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
});
