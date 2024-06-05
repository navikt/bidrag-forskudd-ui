import {
    InntektDtoV2,
    InntekterDtoV2,
    Inntektsrapportering,
    Kilde,
    OppdatereInntektRequest,
    OppdatereManuellInntekt,
    RolleDto,
    Rolletype,
} from "@api/BidragBehandlingApiV1";
import { toISODateString } from "@navikt/bidrag-ui-common";
import { isAfterDate } from "@utils/date-utils";

import { InntektFormPeriode, InntektFormValues } from "../../../types/inntektFormValues";

export const periodeHasHigherPriorityOrder = (
    periode: InntektFormPeriode,
    periodeToCompareWith: InntektFormPeriode
) => {
    if (periodeToCompareWith.kilde === periode.kilde) {
        if (periodeToCompareWith.kilde === Kilde.OFFENTLIG)
            return offentligPeriodeHasHigherOrder(periode, periodeToCompareWith);
        if (periodeToCompareWith.kilde === Kilde.MANUELL)
            return periodeToCompareWith.rapporteringstype >= periode.rapporteringstype;
    }

    return periode.kilde === Kilde.OFFENTLIG && periodeToCompareWith.kilde === Kilde.MANUELL;
};
export const offentligPeriodeHasHigherOrder = (
    periode: InntektFormPeriode,
    periodeToCompareWith: InntektFormPeriode
) => {
    const periodePriority = OffentligInntektPriorityOrder.findIndex(
        (inntektsrapportering) => inntektsrapportering === (periode.rapporteringstype as Inntektsrapportering)
    );
    const periodeToCompareWithPriority = OffentligInntektPriorityOrder.findIndex(
        (inntektsrapportering) =>
            inntektsrapportering === (periodeToCompareWith.rapporteringstype as Inntektsrapportering)
    );

    return periodeToCompareWithPriority > periodePriority;
};
export const OffentligInntektPriorityOrder = [
    Inntektsrapportering.AINNTEKTBEREGNET3MND,
    Inntektsrapportering.AINNTEKTBEREGNET3MNDFRAOPPRINNELIGVEDTAKSTIDSPUNKT,
    Inntektsrapportering.AINNTEKTBEREGNET12MND,
    Inntektsrapportering.AINNTEKTBEREGNET12MNDFRAOPPRINNELIGVEDTAKSTIDSPUNKT,
    Inntektsrapportering.OVERGANGSSTONAD,
    Inntektsrapportering.INTRODUKSJONSSTONAD,
    Inntektsrapportering.KVALIFISERINGSSTONAD,
    Inntektsrapportering.SYKEPENGER,
    Inntektsrapportering.FORELDREPENGER,
    Inntektsrapportering.DAGPENGER,
    Inntektsrapportering.AAP,
    Inntektsrapportering.PENSJON,
    Inntektsrapportering.AINNTEKT,
    Inntektsrapportering.KAPITALINNTEKT,
    Inntektsrapportering.LIGNINGSINNTEKT,
];

export const transformInntekt =
    (virkningsdato: Date) =>
    (inntekt: InntektDtoV2): InntektFormPeriode => ({
        ...inntekt,
        angittPeriode: {
            fom: inntekt.datoFom ?? toISODateString(virkningsdato),
            til: inntekt.datoTom ?? null,
        },
        datoFom: inntekt.datoFom ?? toISODateString(virkningsdato),
        datoTom: inntekt.datoTom ?? null,
        inntektstype: inntekt.inntektstyper.length ? inntekt.inntektstyper[0] : "",
        beløpMnd: inntekt.rapporteringstype === Inntektsrapportering.BARNETILLEGG ? inntekt.beløp / 12 : undefined,
    });

export const inntektSorting = (a: InntektFormPeriode, b: InntektFormPeriode) => {
    if (a.taMed === b.taMed) {
        if (isAfterDate(a.datoFom, b.datoFom)) return 1;
        if (a.datoFom === b.datoFom) {
            return periodeHasHigherPriorityOrder(a, b) ? -1 : 1;
        }
        return -1;
    }
    if (a.taMed !== b.taMed) {
        return a.taMed ? 1 : -1;
    }
};
export const createInitialValues = (
    bmOgBarn: RolleDto[],
    inntekter: InntekterDtoV2,
    virkningsdato: Date
): InntektFormValues => {
    const barn = bmOgBarn.filter((rolle) => rolle.rolletype === Rolletype.BA);
    const transformFn = transformInntekt(virkningsdato);

    return {
        årsinntekter: bmOgBarn.reduce(
            (acc, rolle) => ({
                ...acc,
                [rolle.ident]: inntekter.årsinntekter
                    ?.filter((inntekt) => inntekt.ident === rolle.ident)
                    .map(transformFn),
            }),
            {}
        ),
        barnetillegg: barn.reduce(
            (acc, rolle) => ({
                ...acc,
                [rolle.ident]: inntekter.barnetillegg
                    ?.filter((inntekt) => inntekt.gjelderBarn === rolle.ident)
                    .map(transformFn),
            }),
            {}
        ),
        kontantstøtte: barn.reduce(
            (acc, rolle) => ({
                ...acc,
                [rolle.ident]: inntekter.kontantstøtte
                    ?.filter((inntekt) => inntekt.gjelderBarn === rolle.ident)
                    .map(transformFn),
            }),
            {}
        ),
        småbarnstillegg: inntekter.småbarnstillegg?.map(transformFn),
        utvidetBarnetrygd: inntekter.utvidetBarnetrygd?.map(transformFn),
        notat: {
            kunINotat: inntekter.notat.kunINotat,
        },
    };
};

export const createPayload = (periode: InntektFormPeriode, virkningsdato: Date): OppdatereInntektRequest => {
    const erOffentlig = periode.kilde === Kilde.OFFENTLIG;

    if (erOffentlig) {
        return {
            oppdatereInntektsperiode: {
                id: periode.id,
                taMedIBeregning: periode.taMed,
                angittPeriode: {
                    fom: periode.taMed ? periode.datoFom : toISODateString(virkningsdato),
                    til: periode.taMed ? periode.datoTom : null,
                },
            },
        };
    }
    return {
        oppdatereManuellInntekt: {
            id: periode.id,
            taMed: periode.taMed,
            type: periode.rapporteringstype as Inntektsrapportering,
            beløp:
                periode.rapporteringstype === Inntektsrapportering.BARNETILLEGG ? periode.beløpMnd * 12 : periode.beløp,
            datoFom: periode.datoFom,
            datoTom: periode.datoTom,
            ident: periode.ident,
            gjelderBarn: periode.gjelderBarn,
            inntektstype: periode.inntektstype ? periode.inntektstype : null,
        } as OppdatereManuellInntekt,
    };
};
