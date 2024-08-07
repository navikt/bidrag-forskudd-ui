import {
    InntektDtoV2,
    InntekterDtoV2,
    Inntektsrapportering,
    Kilde,
    OppdatereInntektRequest,
    OppdatereManuellInntekt,
    RolleDto,
    Rolletype,
    TypeBehandling,
} from "@api/BidragBehandlingApiV1";
import { InntektFormPeriode, InntektFormValues } from "@common/types/inntektFormValues";
import { toISODateString } from "@navikt/bidrag-ui-common";
import { isAfterDate } from "@utils/date-utils";

export enum InntektTableType {
    SKATTEPLIKTIG = "SKATTEPLIKTIG",
    UTVIDET_BARNETRYGD = "UTVIDET_BARNETRYGD",
    SMÅBARNSTILLEGG = "SMÅBARNSTILLEGG",
    KONTANTSTØTTE = "KONTANTSTØTTE",
    BARNETILLEGG = "BARNETILLEGG",
    BEREGNET_INNTEKTER = "BEREGNET_INNTEKTER",
    TOTAL_INNTEKTER = "TOTAL_INNTEKTER",
}
export const inntekterTablesViewRules = {
    [TypeBehandling.SAeRBIDRAG]: {
        [Rolletype.BM]: [
            InntektTableType.SKATTEPLIKTIG,
            InntektTableType.BARNETILLEGG,
            InntektTableType.UTVIDET_BARNETRYGD,
            InntektTableType.SMÅBARNSTILLEGG,
            InntektTableType.KONTANTSTØTTE,
            InntektTableType.BEREGNET_INNTEKTER,
        ],
        [Rolletype.BP]: [
            InntektTableType.SKATTEPLIKTIG,
            InntektTableType.BARNETILLEGG,
            InntektTableType.BEREGNET_INNTEKTER,
        ],
        [Rolletype.BA]: [InntektTableType.SKATTEPLIKTIG, InntektTableType.BEREGNET_INNTEKTER],
    },
    [TypeBehandling.FORSKUDD]: {
        [Rolletype.BM]: [
            InntektTableType.SKATTEPLIKTIG,
            InntektTableType.BARNETILLEGG,
            InntektTableType.UTVIDET_BARNETRYGD,
            InntektTableType.SMÅBARNSTILLEGG,
            InntektTableType.KONTANTSTØTTE,
            InntektTableType.BEREGNET_INNTEKTER,
        ],
        [Rolletype.BP]: [],
        [Rolletype.BA]: [InntektTableType.SKATTEPLIKTIG],
    },
};

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

export const ekplisitteYtelser = [
    Inntektsrapportering.KONTANTSTOTTE,
    Inntektsrapportering.UTVIDET_BARNETRYGD,
    Inntektsrapportering.SMABARNSTILLEGG,
    Inntektsrapportering.BARNETILLEGG,
];

export const manuelleInntekterValg = {
    [TypeBehandling.FORSKUDD]: [
        Inntektsrapportering.LONNMANUELTBEREGNET,
        Inntektsrapportering.KAPITALINNTEKT_EGNE_OPPLYSNINGER,
        Inntektsrapportering.PERSONINNTEKT_EGNE_OPPLYSNINGER,
        Inntektsrapportering.SAKSBEHANDLER_BEREGNET_INNTEKT,
        Inntektsrapportering.NAeRINGSINNTEKTMANUELTBEREGNET,
        Inntektsrapportering.YTELSE_FRA_OFFENTLIG_MANUELT_BEREGNET,
    ],
    [TypeBehandling.SAeRBIDRAG]: [
        Inntektsrapportering.LONNMANUELTBEREGNET,
        Inntektsrapportering.KAPITALINNTEKT_EGNE_OPPLYSNINGER,
        Inntektsrapportering.PERSONINNTEKT_EGNE_OPPLYSNINGER,
        Inntektsrapportering.SAKSBEHANDLER_BEREGNET_INNTEKT,
        Inntektsrapportering.NAeRINGSINNTEKTMANUELTBEREGNET,
        Inntektsrapportering.YTELSE_FRA_OFFENTLIG_MANUELT_BEREGNET,
        Inntektsrapportering.SKJONNMANGLENDEBRUKAVEVNE,
        Inntektsrapportering.SKJONNMANGLERDOKUMENTASJON,
    ],
};
export const transformInntekt =
    (virkningsdato: Date) =>
    (inntekt: InntektDtoV2): InntektFormPeriode => {
        return {
            ...inntekt,
            angittPeriode: {
                fom: inntekt.datoFom ?? toISODateString(virkningsdato),
                til: inntekt.datoTom ?? null,
            },
            datoFom:
                inntekt.datoFom ??
                (ekplisitteYtelser.includes(inntekt.rapporteringstype) &&
                isAfterDate(inntekt.opprinneligFom, virkningsdato)
                    ? inntekt.opprinneligFom
                    : toISODateString(virkningsdato)),
            datoTom:
                inntekt.datoTom ??
                (ekplisitteYtelser.includes(inntekt.rapporteringstype) && inntekt.opprinneligTom
                    ? inntekt.opprinneligTom
                    : null),
            inntektstype: inntekt.inntektstyper.length ? inntekt.inntektstyper[0] : "",
            beløpMnd: inntekt.rapporteringstype === Inntektsrapportering.BARNETILLEGG ? inntekt.beløp / 12 : undefined,
            kanRedigeres: inntekt.kilde === Kilde.MANUELL || !ekplisitteYtelser.includes(inntekt.rapporteringstype),
        };
    };

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
    roller: RolleDto[],
    inntekter: InntekterDtoV2,
    virkningsdato: Date
): InntektFormValues => {
    const barnListe = roller.filter((rolle) => rolle.rolletype === Rolletype.BA);
    const transformFn = transformInntekt(virkningsdato);

    return {
        årsinntekter: roller.reduce(
            (acc, rolle) => ({
                ...acc,
                [rolle.ident]: inntekter.årsinntekter
                    ?.filter((inntekt) => inntekt.ident === rolle.ident)
                    .map(transformFn),
            }),
            {}
        ),
        barnetillegg: roller.reduce(
            (acc, rolle) => ({
                ...acc,
                [rolle.ident]: barnListe.reduce(
                    (acc, barn) => ({
                        ...acc,
                        [barn.ident]: inntekter.barnetillegg
                            ?.filter((inntekt) => inntekt.gjelderBarn === barn.ident && inntekt.ident === rolle.ident)
                            .map(transformFn),
                    }),
                    {}
                ),
            }),
            {}
        ),
        kontantstøtte: roller.reduce(
            (acc, rolle) => ({
                ...acc,
                [rolle.ident]: barnListe.reduce(
                    (acc, barn) => ({
                        ...acc,
                        [barn.ident]: inntekter.kontantstøtte
                            ?.filter((inntekt) => inntekt.gjelderBarn === barn.ident && inntekt.ident === rolle.ident)
                            .map(transformFn),
                    }),
                    {}
                ),
            }),
            {}
        ),
        småbarnstillegg: roller.reduce(
            (acc, rolle) => ({
                ...acc,
                [rolle.ident]: inntekter.småbarnstillegg
                    ?.filter((inntekt) => inntekt.ident === rolle.ident)
                    .map(transformFn),
            }),
            {}
        ),
        utvidetBarnetrygd: roller.reduce(
            (acc, rolle) => ({
                ...acc,
                [rolle.ident]: inntekter.utvidetBarnetrygd
                    ?.filter((inntekt) => inntekt.ident === rolle.ident)
                    .map(transformFn),
            }),
            {}
        ),
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
                angittPeriode: !ekplisitteYtelser.includes(periode.rapporteringstype as Inntektsrapportering)
                    ? {
                          fom: periode.taMed ? periode.datoFom : toISODateString(virkningsdato),
                          til: periode.taMed ? periode.datoTom : null,
                      }
                    : null,
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
