import { addDays, toISODateString } from "@navikt/bidrag-ui-common";

import {
    InntektDtoV2,
    InntekterDtoV2,
    Inntektsrapportering,
    RolleDto,
    Rolletype,
} from "../../../api/BidragBehandlingApiV1";
import { InntektFormPeriode, InntektFormValues } from "../../../types/inntektFormValues";
import { dateOrNull, isAfterDate, isBeforeDate } from "../../../utils/date-utils";
import { periodsAreOverlapping } from "./helpers";

const transformInntekt = (inntekt) => ({
    ...inntekt,
    angittPeriode: {
        fom: inntekt.datoFom ?? null,
        til: inntekt.datoTom ?? null,
    },
    datoFom: inntekt.datoFom ?? null,
    datoTom: inntekt.datoTom ?? null,
    inntektstype: inntekt.inntektstyper.length ? inntekt.inntektstyper[0] : "",
});

const reduceAndMapRolleToInntekt = (mapFunction) => (acc, rolle) => ({
    ...acc,
    [rolle.ident]: mapFunction(rolle),
});
const inntektSorting = (a: InntektFormPeriode, b: InntektFormPeriode) => {
    if (a.taMed === b.taMed) {
        return isAfterDate(a.datoFom, b.datoFom) ? 1 : -1;
    }
    if (a.taMed !== b.taMed) {
        return a.taMed ? 1 : -1;
    }
};
const mapInntekterToRolle =
    (inntekter: InntektDtoV2[], fieldToCheck: string) =>
    (rolle): InntektDtoV2[] =>
        inntekter
            ?.filter((inntekt) => inntekt[fieldToCheck] === rolle.ident)
            .map(transformInntekt)
            .sort(inntektSorting);

export const getInntektPerioder = (
    roller: RolleDto[],
    inntekter: InntektDtoV2[],
    comparisonField: "gjelderBarn" | "ident"
) => roller.reduce(reduceAndMapRolleToInntekt(mapInntekterToRolle(inntekter, comparisonField)), {});

export const createInitialValues = (bmOgBarn: RolleDto[], inntekter: InntekterDtoV2): InntektFormValues => {
    const barn = bmOgBarn.filter((rolle) => rolle.rolletype === Rolletype.BA);
    return {
        årsinntekter: getInntektPerioder(bmOgBarn, inntekter.årsinntekter, "ident"),
        barnetillegg: getInntektPerioder(barn, inntekter.barnetillegg, "gjelderBarn"),
        småbarnstillegg: inntekter.småbarnstillegg?.map(transformInntekt),
        kontantstøtte: getInntektPerioder(barn, inntekter.kontantstøtte, "gjelderBarn"),
        utvidetBarnetrygd: inntekter.utvidetBarnetrygd?.map(transformInntekt),
        notat: {
            medIVedtaket: inntekter.notat.medIVedtaket,
            kunINotat: inntekter.notat.kunINotat,
        },
    };
};
const canRunInParallelWithInntektType = (inntektType: Inntektsrapportering | "") => {
    switch (inntektType) {
        case Inntektsrapportering.AINNTEKTBEREGNET3MND:
        case Inntektsrapportering.AINNTEKTBEREGNET12MND:
        case Inntektsrapportering.AINNTEKT:
        case Inntektsrapportering.LIGNINGSINNTEKT:
            return [
                Inntektsrapportering.KAPITALINNTEKT,
                Inntektsrapportering.NETTO_KAPITALINNTEKT,
                Inntektsrapportering.KAPITALINNTEKT_EGNE_OPPLYSNINGER,
                Inntektsrapportering.KAPITALINNTEKT_SKE,
                Inntektsrapportering.NAeRINGSINNTEKTMANUELTBEREGNET,
            ];
        case Inntektsrapportering.KAPITALINNTEKT:
        case Inntektsrapportering.NETTO_KAPITALINNTEKT:
        case Inntektsrapportering.KAPITALINNTEKT_SKE:
        case Inntektsrapportering.KAPITALINNTEKT_EGNE_OPPLYSNINGER:
            return Object.values(Inntektsrapportering).filter(
                (value) =>
                    ![
                        Inntektsrapportering.KAPITALINNTEKT,
                        Inntektsrapportering.NETTO_KAPITALINNTEKT,
                        Inntektsrapportering.KAPITALINNTEKT_SKE,
                        Inntektsrapportering.KAPITALINNTEKT_EGNE_OPPLYSNINGER,
                    ].includes(value)
            );
        case Inntektsrapportering.DAGPENGER:
            return [
                Inntektsrapportering.KAPITALINNTEKT,
                Inntektsrapportering.NETTO_KAPITALINNTEKT,
                Inntektsrapportering.KAPITALINNTEKT_SKE,
                Inntektsrapportering.KAPITALINNTEKT_EGNE_OPPLYSNINGER,
                Inntektsrapportering.AAP,
                Inntektsrapportering.BARNS_SYKDOM,
                Inntektsrapportering.FODSELADOPSJON,
                Inntektsrapportering.PENSJON,
                Inntektsrapportering.SYKEPENGER,
                Inntektsrapportering.NAeRINGSINNTEKTMANUELTBEREGNET,
                Inntektsrapportering.LONNTREKK,
            ];
        case Inntektsrapportering.AAP:
            return [
                Inntektsrapportering.KAPITALINNTEKT,
                Inntektsrapportering.NETTO_KAPITALINNTEKT,
                Inntektsrapportering.KAPITALINNTEKT_SKE,
                Inntektsrapportering.KAPITALINNTEKT_EGNE_OPPLYSNINGER,
                Inntektsrapportering.DAGPENGER,
                Inntektsrapportering.BARNS_SYKDOM,
                Inntektsrapportering.FODSELADOPSJON,
                Inntektsrapportering.PENSJON,
                Inntektsrapportering.SYKEPENGER,
                Inntektsrapportering.NAeRINGSINNTEKTMANUELTBEREGNET,
                Inntektsrapportering.LONNTREKK,
            ];
        case Inntektsrapportering.BARNS_SYKDOM:
            return [
                Inntektsrapportering.KAPITALINNTEKT,
                Inntektsrapportering.NETTO_KAPITALINNTEKT,
                Inntektsrapportering.KAPITALINNTEKT_SKE,
                Inntektsrapportering.KAPITALINNTEKT_EGNE_OPPLYSNINGER,
                Inntektsrapportering.DAGPENGER,
                Inntektsrapportering.AAP,
                Inntektsrapportering.FODSELADOPSJON,
                Inntektsrapportering.PENSJON,
                Inntektsrapportering.SYKEPENGER,
                Inntektsrapportering.NAeRINGSINNTEKTMANUELTBEREGNET,
                Inntektsrapportering.LONNTREKK,
            ];
        case Inntektsrapportering.FODSELADOPSJON:
            return [
                Inntektsrapportering.KAPITALINNTEKT,
                Inntektsrapportering.NETTO_KAPITALINNTEKT,
                Inntektsrapportering.KAPITALINNTEKT_SKE,
                Inntektsrapportering.KAPITALINNTEKT_EGNE_OPPLYSNINGER,
                Inntektsrapportering.DAGPENGER,
                Inntektsrapportering.AAP,
                Inntektsrapportering.BARNS_SYKDOM,
                Inntektsrapportering.PENSJON,
                Inntektsrapportering.SYKEPENGER,
                Inntektsrapportering.NAeRINGSINNTEKTMANUELTBEREGNET,
                Inntektsrapportering.LONNTREKK,
            ];
        case Inntektsrapportering.PENSJON:
            return [
                Inntektsrapportering.KAPITALINNTEKT,
                Inntektsrapportering.NETTO_KAPITALINNTEKT,
                Inntektsrapportering.KAPITALINNTEKT_SKE,
                Inntektsrapportering.KAPITALINNTEKT_EGNE_OPPLYSNINGER,
                Inntektsrapportering.DAGPENGER,
                Inntektsrapportering.AAP,
                Inntektsrapportering.BARNS_SYKDOM,
                Inntektsrapportering.FODSELADOPSJON,
                Inntektsrapportering.SYKEPENGER,
                Inntektsrapportering.NAeRINGSINNTEKTMANUELTBEREGNET,
                Inntektsrapportering.LONNTREKK,
            ];
        case Inntektsrapportering.PERSONINNTEKT_EGNE_OPPLYSNINGER:
        case Inntektsrapportering.SAKSBEHANDLER_BEREGNET_INNTEKT:
            return [
                Inntektsrapportering.KAPITALINNTEKT,
                Inntektsrapportering.NETTO_KAPITALINNTEKT,
                Inntektsrapportering.KAPITALINNTEKT_SKE,
                Inntektsrapportering.KAPITALINNTEKT_EGNE_OPPLYSNINGER,
            ];
        case Inntektsrapportering.SYKEPENGER:
            return [
                Inntektsrapportering.KAPITALINNTEKT,
                Inntektsrapportering.NETTO_KAPITALINNTEKT,
                Inntektsrapportering.KAPITALINNTEKT_SKE,
                Inntektsrapportering.KAPITALINNTEKT_EGNE_OPPLYSNINGER,
                Inntektsrapportering.DAGPENGER,
                Inntektsrapportering.AAP,
                Inntektsrapportering.BARNS_SYKDOM,
                Inntektsrapportering.FODSELADOPSJON,
                Inntektsrapportering.PENSJON,
                Inntektsrapportering.NAeRINGSINNTEKTMANUELTBEREGNET,
                Inntektsrapportering.LONNTREKK,
            ];
        case Inntektsrapportering.LONNTREKK:
            return [
                Inntektsrapportering.KAPITALINNTEKT,
                Inntektsrapportering.NETTO_KAPITALINNTEKT,
                Inntektsrapportering.KAPITALINNTEKT_SKE,
                Inntektsrapportering.KAPITALINNTEKT_EGNE_OPPLYSNINGER,
                Inntektsrapportering.DAGPENGER,
                Inntektsrapportering.AAP,
                Inntektsrapportering.BARNS_SYKDOM,
                Inntektsrapportering.FODSELADOPSJON,
                Inntektsrapportering.PENSJON,
                Inntektsrapportering.NAeRINGSINNTEKTMANUELTBEREGNET,
                Inntektsrapportering.SYKEPENGER,
            ];
        case Inntektsrapportering.YTELSE_FRA_OFFENTLIG_MANUELT_BEREGNET:
            return [
                Inntektsrapportering.KAPITALINNTEKT,
                Inntektsrapportering.NETTO_KAPITALINNTEKT,
                Inntektsrapportering.KAPITALINNTEKT_SKE,
                Inntektsrapportering.KAPITALINNTEKT_EGNE_OPPLYSNINGER,
                Inntektsrapportering.NAeRINGSINNTEKTMANUELTBEREGNET,
                Inntektsrapportering.LONNTREKK,
            ];
        default:
            return Object.values(Inntektsrapportering).filter((value) => value !== inntektType);
    }
};

export const checkErrorsInPeriods = (
    virkningstidspunkt: Date,
    perioder: InntektFormPeriode[]
): {
    overlappingPeriodIndexes: number[];
    gapsInPeriods: { datoFom: string; datoTom: string }[];
    overlappingPeriodsSummary: { datoFom: string; datoTom: string }[];
} => {
    const overlappingPeriodIndexes: number[][] = [];
    const gapsInPeriods: { datoFom: string; datoTom: string }[] = [];
    const firstTaMedPeriod = perioder.find((periode) => periode.taMed);

    if (firstTaMedPeriod && isBeforeDate(virkningstidspunkt, firstTaMedPeriod?.datoFom)) {
        gapsInPeriods.push({
            datoFom: toISODateString(virkningstidspunkt),
            datoTom: firstTaMedPeriod.datoFom,
        });
    }

    for (let i = 0; i < perioder.length; i++) {
        for (let j = i + 1; j < perioder.length; j++) {
            if (perioder[i].taMed && perioder[j].taMed) {
                if (
                    periodsAreOverlapping(perioder[i], perioder[j]) &&
                    !canRunInParallelWithInntektType(perioder[i].rapporteringstype).includes(
                        perioder[j].rapporteringstype as Inntektsrapportering
                    )
                ) {
                    overlappingPeriodIndexes.push([i, j]);
                }

                if (
                    perioder[i].datoTom &&
                    isAfterDate(dateOrNull(perioder[j].datoFom), addDays(dateOrNull(perioder[i].datoTom), 1))
                ) {
                    gapsInPeriods.push({
                        datoFom: perioder[i].datoTom,
                        datoTom: perioder[j].datoFom,
                    });
                }
            }
        }
    }

    return {
        gapsInPeriods,
        overlappingPeriodIndexes: [...new Set(overlappingPeriodIndexes.flat())],
        overlappingPeriodsSummary: getSummaryOfOverlappingPeriods(overlappingPeriodIndexes, perioder),
    };
};

export const getSummaryOfOverlappingPeriods = (
    overlappingPeriodIndexes: number[][],
    perioder: InntektFormPeriode[]
): { datoFom: string; datoTom: string }[] => {
    return Object.values(
        overlappingPeriodIndexes.reduce((acc, indexPair) => {
            const periodA = perioder[indexPair[0]];
            const periodB = perioder[indexPair[1]];
            const pairKey = `${periodA.rapporteringstype}-${periodB.rapporteringstype}`;
            const existingOverlapingPeriodKey = Object.keys(acc).find(
                (key) => key.includes(periodA.rapporteringstype) || key.includes(periodB.rapporteringstype)
            );
            const existingOverlapingPeriod = acc[existingOverlapingPeriodKey];

            if (existingOverlapingPeriod) {
                const currentPairFomAndTom = {
                    datoFom: isBeforeDate(periodA.datoFom, periodB.datoFom) ? periodA.datoFom : periodB.datoFom,
                    datoTom:
                        periodA.datoTom === null || (periodB.datoTom && isAfterDate(periodA.datoTom, periodB.datoTom))
                            ? periodA.datoTom
                            : periodB.datoTom,
                };
                const updatedObject = {
                    ...acc,
                    [`${existingOverlapingPeriodKey}-${pairKey}`]: {
                        datoFom: isBeforeDate(currentPairFomAndTom.datoFom, existingOverlapingPeriod.datoFom)
                            ? currentPairFomAndTom.datoFom
                            : existingOverlapingPeriod.datoFom,
                        datoTom:
                            periodA.datoTom === null ||
                            (periodB.datoTom &&
                                isAfterDate(currentPairFomAndTom.datoTom, existingOverlapingPeriod.datoTom))
                                ? currentPairFomAndTom.datoTom
                                : existingOverlapingPeriod.datoTom,
                    },
                };
                delete updatedObject[existingOverlapingPeriodKey];
                return updatedObject;
            }

            return {
                ...acc,
                [pairKey]: {
                    datoFom: isBeforeDate(periodA.datoFom, periodB.datoFom) ? periodA.datoFom : periodB.datoFom,
                    datoTom: isAfterDate(periodA.datoTom, periodB.datoTom) ? periodA.datoTom : periodB.datoTom,
                },
            };
        }, {})
    );
};
