import { expect } from "chai";
import { describe } from "mocha";

import { fillInPeriodGaps } from "../../components/forms/helpers/boforholdFormHelpers";

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
});
