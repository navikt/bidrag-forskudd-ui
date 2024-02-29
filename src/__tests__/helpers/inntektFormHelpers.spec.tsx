import { expect } from "chai";
import { describe } from "mocha";

import { Inntektsrapportering, Kilde } from "../../api/BidragBehandlingApiV1";
import { editPeriods } from "../../components/forms/helpers/inntektFormHelpers";

describe("InntektFormHelpers", () => {
    it.skip("should merge periods if there is no gap between 2 periods in Folkeregistre", () => {
        const inntekter = [
            {
                rapporteringstype: Inntektsrapportering.LONNTREKK,
                datoFom: null,
                taMed: true,
                fraGrunnlag: true,
                datoTom: null,
                beløp: 10,
                ident: "",
                kilde: Kilde.OFFENTLIG,
                inntektsposter: [],
                inntektstyper: [],
            },
        ];
        const expectedResult = [
            {
                rapporteringstype: Inntektsrapportering.LONNTREKK,
                datoFom: null,
                taMed: true,
                fraGrunnlag: true,
                datoTom: null,
                beløp: 10,
                ident: "",
                kilde: Kilde.OFFENTLIG,
                inntektsposter: [],
                inntektstyper: [],
            },
        ];
        const updatedInntekter = editPeriods(inntekter, 2);
        expect(updatedInntekter.length).equals(expectedResult.length);
        updatedInntekter.forEach((inntekt, i) => {
            expect(inntekt.datoFom).equals(expectedResult[i].datoFom);
            expect(inntekt.datoTom).equals(expectedResult[i].datoTom);
            expect(inntekt.rapporteringstype).equals(expectedResult[i].rapporteringstype);
        });
    });
});
