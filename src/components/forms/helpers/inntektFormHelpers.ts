import { isValidDate } from "@navikt/bidrag-ui-common";

import {
    InntektDtoV2,
    InntekterDtoV2,
    Inntektsrapportering,
    RolleDto,
    Rolletype,
} from "../../../api/BidragBehandlingApiV1";
import { perioderSomIkkeKanOverlape, perioderSomKanIkkeOverlapeKunMedHverandre } from "../../../constants/inntektene";
import { InntektFormValues } from "../../../types/inntektFormValues";
import { isAfterDate } from "../../../utils/date-utils";

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

const mapInntekterToRolle =
    (inntekter: InntektDtoV2[], fieldToCheck: string) =>
    (rolle): InntektDtoV2[] =>
        inntekter
            ?.filter((inntekt) => inntekt[fieldToCheck] === rolle.ident)
            .map(transformInntekt)
            .sort((a, b) => (isAfterDate(a.datoFom, b.datoFom) ? 1 : -1));

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
export const editPeriods = (periodsList: InntektDtoV2[], periodeIndex: number): InntektDtoV2[] => {
    const editedPeriod = periodsList[periodeIndex];
    const inntektType = editedPeriod.rapporteringstype;
    const listOfIncomesThatCanRunInParallelWithEditedPeriode =
        getListOfIncomesThatCanRunInParallelWithInntektType(inntektType);

    const periodsThatCannotRunInParallel = periodsList
        .toSpliced(periodeIndex, 1)
        .filter((period) => !listOfIncomesThatCanRunInParallelWithEditedPeriode.includes(period.rapporteringstype));
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
        .filter((period) => listOfIncomesThatCanRunInParallelWithEditedPeriode.includes(period.rapporteringstype))
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
