import { expect } from "chai";
import { describe } from "mocha";

import { Inntektsrapportering } from "../../api/BidragBehandlingApiV1";
import { editPeriods } from "../../components/forms/helpers/inntektFormHelpers";

describe("InntektFormHelpers", () => {
    it.skip("should merge periods if there is no gap between 2 periods in Folkeregistre", () => {
        const inntekter = [
            {
                inntektType: Inntektsrapportering.LONNTREKK,
                datoFom: null,
                taMed: true,
                fraGrunnlag: true,
                datoTom: null,
                belop: 10,
                inntektPostListe: [],
            },
        ];
        const expectedResult = [
            {
                inntektType: Inntektsrapportering.LONNTREKK,
                datoFom: null,
                taMed: true,
                fraGrunnlag: true,
                datoTom: null,
                belop: 10,
                inntektPostListe: [],
            },
        ];
        const updatedInntekter = editPeriods(inntekter, 2);
        expect(updatedInntekter.length).equals(expectedResult.length);
        updatedInntekter.forEach((inntekt, i) => {
            expect(inntekt.datoFom).equals(expectedResult[i].datoFom);
            expect(inntekt.datoTom).equals(expectedResult[i].datoTom);
            expect(inntekt.inntektType).equals(expectedResult[i].inntektType);
        });
    });
});