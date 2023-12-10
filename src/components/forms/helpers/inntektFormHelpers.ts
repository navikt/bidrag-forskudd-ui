import { isValidDate, lastDayOfMonth } from "@navikt/bidrag-ui-common";

import {
    InntektDto,
    InntekterDtoV2,
    Inntektsrapportering,
    OppdaterBehandlingRequest,
    RolleDto,
} from "../../../api/BidragBehandlingApiV1";
import { perioderSomIkkeKanOverlape, perioderSomKanIkkeOverlapeKunMedHverandre } from "../../../constants/inntektene";
import { Inntekt, InntektFormValues, InntektTransformed } from "../../../types/inntektFormValues";
import { isAfterDate, toISODateString } from "../../../utils/date-utils";

export const createInntektPayload = (values: InntektFormValues): OppdaterBehandlingRequest => ({
    inntekter: {
        inntekter: Object.entries(values.inntekteneSomLeggesTilGrunn)
            .map(([key, value]) =>
                value.map((inntekt) => {
                    return {
                        ...inntekt,
                        inntektstype:
                            inntekt.inntektstype === "" ? null : (inntekt.inntektstype as Inntektsrapportering),
                        ident: key,
                        beløp: Number(inntekt.beløp),
                        inntektPostListe: inntekt.inntektsposter,
                        datoFom: toISODateString(new Date(inntekt.datoFom)),
                        datoTom: inntekt.datoTom ? toISODateString(new Date(inntekt.datoTom)) : null,
                    };
                })
            )
            .flat(),
        utvidetbarnetrygd: values.utvidetbarnetrygd.length
            ? values.utvidetbarnetrygd.map((utvidetbarnetrygd) => ({
                  ...utvidetbarnetrygd,
                  beløp: Number(utvidetbarnetrygd.beløp),
              }))
            : [],
        barnetillegg: values.barnetillegg.length
            ? values.barnetillegg.map((barnetillegg) => ({
                  ...barnetillegg,
                  ident: barnetillegg.ident,
                  gjelderBarn: barnetillegg.ident,
                  barnetillegg: Number(barnetillegg.barnetillegg),
              }))
            : [],
        notat: {
            medIVedtaket: values.notat?.medIVedtaket,
            kunINotat: values.notat?.kunINotat,
        },
    },
});

const reduceAndMapRolleToInntekt = (mapFunction) => (acc, rolle) => ({
    ...acc,
    [rolle.ident]: mapFunction(rolle),
});

const mapInntekterToRolle =
    (inntekter: InntektDto[]) =>
    (rolle): Inntekt[] =>
        inntekter
            .filter((inntekt) => inntekt.ident === rolle.ident)
            .map((inntekt) => ({
                ...inntekt,
                inntektstype: inntekt.inntektstype ?? "",
                datoFom: inntekt.datoFom ?? null,
                datoTom: inntekt.datoTom ?? null,
            }))
            .sort((a, b) => (isAfterDate(a.datoFom, b.datoFom) ? 1 : -1));

export const getPerioderFraInntekter = (bmOgBarn: RolleDto[], inntekter: InntektDto[]) =>
    bmOgBarn.reduce(reduceAndMapRolleToInntekt(mapInntekterToRolle(inntekter)), {});

export const getPerioderFraBidragInntekt = (bidragInntekt: InntektTransformed[]) =>
    bidragInntekt.reduce(
        (acc, curr) => ({
            ...acc,
            [curr.ident]: curr.data.summertÅrsinntektListe
                .filter(
                    (inntekt) =>
                        ![
                            Inntektsrapportering.KONTANTSTOTTE,
                            Inntektsrapportering.SMABARNSTILLEGG,
                            Inntektsrapportering.UTVIDET_BARNETRYGD,
                        ].includes(inntekt.inntektRapportering)
                )
                .map((inntekt) => {
                    return {
                        taMed: false,
                        inntektBeskrivelse: inntekt.visningsnavn,
                        inntektstype: inntekt.inntektRapportering,
                        beløp: inntekt.sumInntekt,
                        datoTom:
                            inntekt.periode.til != null
                                ? toISODateString(lastDayOfMonth(new Date(inntekt.periode.til)))
                                : null,
                        datoFom: inntekt.periode.fom,
                        ident: curr.ident,
                        fraGrunnlag: true,
                        inntektsposter: inntekt.inntektPostListe,
                    };
                })
                .sort((a: Inntekt, b: Inntekt) => (isAfterDate(a.datoFom, b.datoFom) ? 1 : -1)) as Inntekt[],
        }),
        {}
    );

export const createInitialValues = (bmOgBarn: RolleDto[], inntekter: InntekterDtoV2): InntektFormValues => {
    return {
        inntekteneSomLeggesTilGrunn: getPerioderFraInntekter(bmOgBarn, inntekter.inntekter),
        utvidetbarnetrygd: [],
        barnetillegg: [],
        notat: {
            medIVedtaket: inntekter.notat.medIVedtaket,
            kunINotat: inntekter.notat.kunINotat,
        },
    };
};
const getListOfIncomesThatCanRunInParallelWithInntektType = (inntektType: string) => {
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
        case Inntektsrapportering.NAeRINGSINNTEKTMANUELTBEREGNET:
            return Object.values(Inntektsrapportering);
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
    }
};
export const editPeriods = (periodsList: Inntekt[], periodeIndex: number): Inntekt[] => {
    const editedPeriod = periodsList[periodeIndex];
    const inntektType = editedPeriod.inntektType;
    const listOfIncomesThatCanRunInParallelWithEditedPeriode =
        getListOfIncomesThatCanRunInParallelWithInntektType(inntektType);

    const periodsThatCannotRunInParallel = periodsList
        .toSpliced(periodeIndex, 1)
        .filter(
            (period) =>
                !listOfIncomesThatCanRunInParallelWithEditedPeriode.includes(period.inntektType as Inntektsrapportering)
        );
    let startIndex = periodsThatCannotRunInParallel.filter(
        (period) => new Date(period.datoFom).getTime() < new Date(editedPeriod.datoFom).getTime()
    ).length;
    const postPeriodIndex = editedPeriod.datoTom
        ? periodsThatCannotRunInParallel.findIndex(
              (period) =>
                  period.datoTom === null || (period.datoTom && isAfterDate(period.datoTom, editedPeriod.datoTom))
          )
        : -1;

    let deleteCount =
        postPeriodIndex === -1 ? periodsThatCannotRunInParallel.length - startIndex : postPeriodIndex - startIndex;
    const prevPeriodIndex = startIndex ? startIndex - 1 : 0;
    const prevPeriod = startIndex ? periodsThatCannotRunInParallel[prevPeriodIndex] : undefined;
    const postPeriod = postPeriodIndex !== -1 ? periodsThatCannotRunInParallel[postPeriodIndex] : undefined;
    const existingPeriodCoversWholeEditedPeriod = prevPeriodIndex === postPeriodIndex;

    if (periodeIndex && existingPeriodCoversWholeEditedPeriod) {
        return periodsThatCannotRunInParallel;
    }

    if (prevPeriod) {
        startIndex -= 1;
        deleteCount += 1;
        editedPeriod.datoFom = prevPeriod.datoFom;
    }

    if (postPeriod) {
        deleteCount += 1;
        editedPeriod.datoTom = postPeriod.datoTom;
    }

    const updatedPeriodsOfSameInntektType = periodsThatCannotRunInParallel.toSpliced(
        startIndex,
        deleteCount,
        editedPeriod
    );

    return periodsList
        .filter((period) =>
            listOfIncomesThatCanRunInParallelWithEditedPeriode.includes(period.inntektType as Inntektsrapportering)
        )
        .concat(updatedPeriodsOfSameInntektType)
        .sort((a, b) => new Date(a.datoFom).getTime() - new Date(b.datoFom).getTime());
};

export const checkOverlappingPeriods = (perioder) => {
    const overlappingPeriods = [];

    for (let i = 0; i < perioder.length; i++) {
        for (let j = i + 1; j < perioder.length; j++) {
            if (
                (perioder[i].tilDato === null || new Date(perioder[i].tilDato) >= new Date(perioder[j].fraDato)) &&
                (perioder[j].tilDato === null || new Date(perioder[j].tilDato) >= new Date(perioder[i].fraDato))
            ) {
                overlappingPeriods.push([`${perioder[i].beskrivelse}`, `${perioder[j].beskrivelse}`]);
            }
        }
    }

    return overlappingPeriods;
};

export const getOverlappingInntektPerioder = (perioder) => {
    const ytelsePerioder = perioder
        .filter(
            (periode) =>
                periode.fraDato &&
                isValidDate(periode.fraDato) &&
                perioderSomIkkeKanOverlape.includes(periode.tekniskNavn)
        )
        .sort((a, b) => new Date(a.fraDato).getTime() - new Date(b.fraDato).getTime());
    const overlappingPeriods = checkOverlappingPeriods(ytelsePerioder);

    perioderSomKanIkkeOverlapeKunMedHverandre.forEach((tekniskNavn) => {
        const filteredAndSortedPerioder = perioder
            .filter((periode) => periode.fraDato && isValidDate(periode.fraDato) && periode.tekniskNavn === tekniskNavn)
            .sort((a, b) => new Date(a.fraDato).getTime() - new Date(b.fraDato).getTime());

        overlappingPeriods.concat(checkOverlappingPeriods(filteredAndSortedPerioder));
    });

    return overlappingPeriods;
};
