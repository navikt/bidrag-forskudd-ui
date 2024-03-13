import { expect } from "chai";
import { describe } from "mocha";

import { Inntektsrapportering, Kilde } from "../../api/BidragBehandlingApiV1";
import { checkErrorsInPeriods } from "../../components/forms/helpers/inntektFormHelpers";

describe("InntektFormHelpers", () => {
    it("should return indexes of overlapping inntekt periods", () => {
        const periods = [
            {
                taMed: true,
                rapporteringstype: Inntektsrapportering.AINNTEKTBEREGNET3MND,
                beløp: 1500,
                datoFom: "2024-01-01",
                datoTom: "2024-12-31",
                ident: "151151515",
                kilde: Kilde.OFFENTLIG,
                inntektsposter: [],
                inntektstyper: [],
            },
            {
                taMed: true,
                rapporteringstype: Inntektsrapportering.DAGPENGER,
                beløp: 1500,
                datoFom: "2024-01-01",
                datoTom: "2024-12-31",
                ident: "151151515",
                kilde: Kilde.OFFENTLIG,
                inntektsposter: [],
                inntektstyper: [],
            },
            {
                taMed: true,
                rapporteringstype: Inntektsrapportering.KAPITALINNTEKT,
                beløp: 1500,
                datoFom: "2024-01-01",
                datoTom: "2024-12-31",
                ident: "151151515",
                kilde: Kilde.OFFENTLIG,
                inntektsposter: [],
                inntektstyper: [],
            },
            {
                taMed: true,
                rapporteringstype: Inntektsrapportering.YTELSE_FRA_OFFENTLIG_MANUELT_BEREGNET,
                beløp: 1500,
                datoFom: "2024-01-01",
                datoTom: "2024-12-31",
                ident: "151151515",
                kilde: Kilde.MANUELL,
                inntektsposter: [],
                inntektstyper: [],
            },
        ];

        const result = checkErrorsInPeriods(new Date(), periods);
        const expectedResult = [0, 1, 3];
        expect(result.overlappingPeriodIndexes).to.have.deep.members(expectedResult);
    });

    it("should return empty array for non overlapping inntekt periods", () => {
        const periods = [
            {
                taMed: true,
                rapporteringstype: Inntektsrapportering.AINNTEKTBEREGNET3MND,
                beløp: 1500,
                datoFom: "2021-01-01",
                datoTom: "2021-12-31",
                ident: "151151515",
                kilde: Kilde.OFFENTLIG,
                inntektsposter: [],
                inntektstyper: [],
            },
            {
                taMed: true,
                rapporteringstype: Inntektsrapportering.DAGPENGER,
                beløp: 1500,
                datoFom: "2022-01-01",
                datoTom: "2022-12-31",
                ident: "151151515",
                kilde: Kilde.OFFENTLIG,
                inntektsposter: [],
                inntektstyper: [],
            },
            {
                taMed: true,
                rapporteringstype: Inntektsrapportering.KAPITALINNTEKT,
                beløp: 1500,
                datoFom: "2023-01-01",
                datoTom: "2023-12-31",
                ident: "151151515",
                kilde: Kilde.OFFENTLIG,
                inntektsposter: [],
                inntektstyper: [],
            },
            {
                taMed: true,
                rapporteringstype: Inntektsrapportering.YTELSE_FRA_OFFENTLIG_MANUELT_BEREGNET,
                beløp: 1500,
                datoFom: "2024-01-01",
                datoTom: null,
                ident: "151151515",
                kilde: Kilde.MANUELL,
                inntektsposter: [],
                inntektstyper: [],
            },
        ];

        const result = checkErrorsInPeriods(new Date(), periods);
        expect(result.overlappingPeriodIndexes).to.be.empty;
    });

    it("should return indexes of overlapping KONTANTSTOTTE periods", () => {
        const periods = [
            {
                taMed: true,
                rapporteringstype: Inntektsrapportering.KONTANTSTOTTE,
                beløp: 1500,
                datoFom: "2024-01-01",
                datoTom: "2024-12-31",
                ident: "151151515",
                kilde: Kilde.OFFENTLIG,
                inntektsposter: [],
                inntektstyper: [],
            },
            {
                taMed: true,
                rapporteringstype: Inntektsrapportering.KONTANTSTOTTE,
                beløp: 1500,
                datoFom: "2024-01-01",
                datoTom: "2024-12-31",
                ident: "151151515",
                kilde: Kilde.OFFENTLIG,
                inntektsposter: [],
                inntektstyper: [],
            },
        ];

        const result = checkErrorsInPeriods(new Date(), periods);
        const expectedResult = [0, 1];
        expect(result.overlappingPeriodIndexes).to.have.deep.members(expectedResult);
    });

    it("should return empty array for non-overlapping KONTANTSTOTTE periods", () => {
        const periods = [
            {
                taMed: true,
                rapporteringstype: Inntektsrapportering.KONTANTSTOTTE,
                beløp: 1500,
                datoFom: "2023-01-01",
                datoTom: "2023-12-31",
                ident: "151151515",
                kilde: Kilde.OFFENTLIG,
                inntektsposter: [],
                inntektstyper: [],
            },
            {
                taMed: true,
                rapporteringstype: Inntektsrapportering.KONTANTSTOTTE,
                beløp: 1500,
                datoFom: "2024-01-01",
                datoTom: "2024-12-31",
                ident: "151151515",
                kilde: Kilde.OFFENTLIG,
                inntektsposter: [],
                inntektstyper: [],
            },
        ];

        const result = checkErrorsInPeriods(new Date(), periods);
        expect(result.overlappingPeriodIndexes).to.be.empty;
    });

    it("should return indexes of overlapping SMABARNSTILLEGG periods", () => {
        const periods = [
            {
                taMed: true,
                rapporteringstype: Inntektsrapportering.SMABARNSTILLEGG,
                beløp: 1500,
                datoFom: "2024-01-01",
                datoTom: "2024-12-31",
                ident: "151151515",
                kilde: Kilde.OFFENTLIG,
                inntektsposter: [],
                inntektstyper: [],
            },
            {
                taMed: true,
                rapporteringstype: Inntektsrapportering.SMABARNSTILLEGG,
                beløp: 1500,
                datoFom: "2024-01-01",
                datoTom: "2024-12-31",
                ident: "151151515",
                kilde: Kilde.OFFENTLIG,
                inntektsposter: [],
                inntektstyper: [],
            },
        ];

        const result = checkErrorsInPeriods(new Date(), periods);
        const expectedResult = [0, 1];
        expect(result.overlappingPeriodIndexes).to.have.deep.members(expectedResult);
    });

    it("should return indexes of overlapping UTVIDET_BARNETRYGD periods", () => {
        const periods = [
            {
                taMed: true,
                rapporteringstype: Inntektsrapportering.UTVIDET_BARNETRYGD,
                beløp: 1500,
                datoFom: "2024-01-01",
                datoTom: "2024-12-31",
                ident: "151151515",
                kilde: Kilde.OFFENTLIG,
                inntektsposter: [],
                inntektstyper: [],
            },
            {
                taMed: true,
                rapporteringstype: Inntektsrapportering.UTVIDET_BARNETRYGD,
                beløp: 1500,
                datoFom: "2024-01-01",
                datoTom: "2024-12-31",
                ident: "151151515",
                kilde: Kilde.OFFENTLIG,
                inntektsposter: [],
                inntektstyper: [],
            },
        ];

        const result = checkErrorsInPeriods(new Date(), periods);
        const expectedResult = [0, 1];
        expect(result.overlappingPeriodIndexes).to.have.deep.members(expectedResult);
    });
});
