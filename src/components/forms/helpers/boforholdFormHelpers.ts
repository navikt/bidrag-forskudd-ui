import { UseFormSetValue } from "react-hook-form";

import { BehandlingDto, BoforholdResponse, BoStatusType, SivilstandDto } from "../../../api/BidragBehandlingApi";
import { HentGrunnlagspakkeDto, RelatertPersonDto } from "../../../api/BidragGrunnlagApi";
import {
    BarnPeriode,
    BoforholdFormValues,
    OpplysningFraFolkeRegistre,
    OpplysningFraFolkeRegistrePeriode,
} from "../../../types/boforholdFormValues";
import {
    addDays,
    dateOrNull,
    deductDays,
    firstDayOfMonth,
    lastDayOfMonth,
    toISODateString,
} from "../../../utils/date-utils";

export const calculateFraDato = (fieldArrayValues: BarnPeriode[] | SivilstandDto[], virkningstidspunkt: Date) => {
    if (fieldArrayValues.length && !fieldArrayValues.some((periode) => periode.datoTom === null)) {
        const filtrertOgSorterListe = fieldArrayValues.sort(
            (a, b) => new Date(a.datoTom).getTime() - new Date(b.datoTom).getTime()
        );
        return toISODateString(addDays(new Date(filtrertOgSorterListe[filtrertOgSorterListe.length - 1].datoTom), 1));
    }

    if (!fieldArrayValues.length) {
        return toISODateString(virkningstidspunkt);
    }
    return null;
};

const fillInPeriodGaps = (egneBarnIHusstanden: RelatertPersonDto) => {
    const perioder: OpplysningFraFolkeRegistrePeriode[] = [];
    const brukFra = new Date(egneBarnIHusstanden.brukFra);
    const fodselsdato = new Date(egneBarnIHusstanden.fodselsdato);
    egneBarnIHusstanden.borISammeHusstandDtoListe.forEach((periode, i) => {
        if (i === 0) {
            if (fodselsdato < new Date(periode.periodeFra) && brukFra < new Date(periode.periodeFra)) {
                perioder.push({
                    fraDato: brukFra < fodselsdato ? fodselsdato : brukFra,
                    tilDato: deductDays(brukFra, 1),
                    boStatus: BoStatusType.IKKE_REGISTRERT_PA_ADRESSE,
                });
            }
        } else if (addDays(perioder[i - 1].tilDato, 1).toDateString() !== new Date(periode.periodeFra).toDateString()) {
            perioder.push({
                fraDato: addDays(perioder[perioder.length - 1].tilDato, 1),
                tilDato: deductDays(new Date(periode.periodeFra), 1),
                boStatus: BoStatusType.IKKE_REGISTRERT_PA_ADRESSE,
            });
        }

        perioder.push({
            fraDato: dateOrNull(periode.periodeFra),
            tilDato: dateOrNull(periode.periodeTil),
            boStatus: BoStatusType.REGISTRERT_PA_ADRESSE,
        });

        if (
            i === egneBarnIHusstanden.borISammeHusstandDtoListe.length - 1 &&
            periode.periodeTil &&
            periode.periodeTil !== egneBarnIHusstanden.brukTil
        ) {
            perioder.push({
                fraDato: addDays(new Date(periode.periodeTil), 1),
                tilDato: dateOrNull(egneBarnIHusstanden.brukTil),
                boStatus: BoStatusType.IKKE_REGISTRERT_PA_ADRESSE,
            });
        }
    });
    return perioder;
};

export const mapHusstandsMedlemmerToBarn = (husstandmedlemmerOgEgneBarnListe: RelatertPersonDto[]) => {
    return husstandmedlemmerOgEgneBarnListe
        .filter((medlem) => medlem.erBarnAvBmBp)
        .map((barn) => ({
            ident: barn.relatertPersonPersonId,
            navn: barn.navn,
            perioder: fillInPeriodGaps(barn),
        }));
};

export const getBarnPerioder = (perioder: OpplysningFraFolkeRegistrePeriode[], datoFom: Date) => {
    const perioderFraVirkningstidspunkt = perioder?.filter(
        (periode) => periode.tilDato === null || new Date(periode.tilDato) > new Date(datoFom)
    );

    const result: {
        boStatus: BoStatusType;
        kilde: "offentlig" | "manuelt";
        datoFom: string;
        datoTom: string | null;
    }[] = [];
    perioderFraVirkningstidspunkt?.forEach((periode, i) => {
        result.push({
            boStatus: periode.boStatus,
            kilde: "offentlig",
            datoFom: toISODateString(
                i === 0
                    ? datoFom
                        ? new Date(datoFom)
                        : firstDayOfMonth(periode.fraDato)
                    : addDays(new Date(result[i - 1].datoTom), 1)
            ),
            datoTom: toISODateString(periode.tilDato ? lastDayOfMonth(periode.tilDato) : periode.tilDato),
        });
    });

    return result;
};
export const getBarnPerioderFromHusstandsListe = (
    opplysningerFraFolkRegistre: OpplysningFraFolkeRegistre[],
    datoFom: Date
) => {
    return opplysningerFraFolkRegistre.map((barn) => ({
        ...barn,
        medISaken: true,
        perioder: getBarnPerioder(barn.perioder, datoFom),
    }));
};

export const getSivilstandPerioder = (sivilstandListe, datoFom): SivilstandDto[] => {
    return sivilstandListe
        .filter((periode) => periode.periodeTil === null || new Date(periode.periodeTil) > new Date(datoFom))
        .map((periode) => ({
            sivilstandType: periode.sivilstand,
            datoFom: toISODateString(
                new Date(periode.periodeFra) < new Date(datoFom) ? datoFom : new Date(periode.periodeFra)
            ),
            datoTom: periode.periodeTil,
        }));
};

export const createInitialValues = (
    behandling: BehandlingDto,
    boforhold: BoforholdResponse,
    opplysningerFraFolkRegistre: OpplysningFraFolkeRegistre[],
    datoFom: Date,
    grunnlagspakke: HentGrunnlagspakkeDto,
    boforoholdOpplysningerExistInDb: boolean
) => ({
    ...boforhold,
    husstandsBarn: boforoholdOpplysningerExistInDb
        ? boforhold.husstandsBarn
        : getBarnPerioderFromHusstandsListe(opplysningerFraFolkRegistre, datoFom),
    sivilstand: boforhold?.sivilstand?.length
        ? boforhold.sivilstand
        : getSivilstandPerioder(grunnlagspakke.sivilstandListe, datoFom),
});

export const createPayload = (values: BoforholdFormValues) => ({
    husstandsBarn: values.husstandsBarn.map((barn) => ({
        ...barn,
        perioder: barn.perioder.map((periode) => ({
            ...periode,
            boStatus: periode.boStatus === "" ? null : periode.boStatus,
        })),
    })),
    sivilstand: values.sivilstand,
    boforholdBegrunnelseMedIVedtakNotat: values.boforholdBegrunnelseMedIVedtakNotat,
    boforholdBegrunnelseKunINotat: values.boforholdBegrunnelseKunINotat,
});

export const checkOverlappingPeriods = (perioder) => {
    const overlappingPeriods = [];

    for (let i = 0; i < perioder.length; i++) {
        for (let j = i + 1; j < perioder.length; j++) {
            if (
                (perioder[i].datoTom === null || perioder[i].datoTom >= perioder[j].datoFom) &&
                (perioder[j].datoTom === null || perioder[j].datoTom >= perioder[i].datoFom)
            ) {
                overlappingPeriods.push([`${perioder[i]}`, `${perioder[j]}`]);
            }
        }
    }

    return overlappingPeriods;
};

export const syncDates = (
    periods: BarnPeriode[],
    date: string | null,
    barnIndex: number,
    periodeIndex: number,
    field: "datoFom" | "datoTom",
    setValue: UseFormSetValue<BoforholdFormValues>
) => {
    if (field === "datoFom" && periods[periodeIndex - 1] && date) {
        setValue(
            `husstandsBarn.${barnIndex}.perioder.${periodeIndex - 1}.datoTom`,
            toISODateString(deductDays(new Date(date), 1))
        );
    }
    if (field === "datoTom" && periods[periodeIndex + 1] && date) {
        setValue(
            `husstandsBarn.${barnIndex}.perioder.${periodeIndex + 1}.datoFom`,
            toISODateString(addDays(new Date(date), 1))
        );
    }
    setValue(`husstandsBarn.${barnIndex}.perioder.${periodeIndex}.${field}`, date);
};

export const compareOpplysninger = (savedOpplysninger, latestOpplysninger) => {
    const changedLog = [];

    if (savedOpplysninger.husstand.length < latestOpplysninger.husstand.length) {
        changedLog.push("Det er flere barn registret i folkeregistre.");
    }
    if (savedOpplysninger.husstand.length > latestOpplysninger.husstand.length) {
        changedLog.push("Det er fære barn registret i folkeregistre.");
    }

    savedOpplysninger.husstand.forEach((barn) => {
        const barnInLatestOpplysninger = latestOpplysninger.husstand.find((b) => barn.ident === b.ident);
        if (barnInLatestOpplysninger.perioder.length > barn.perioder.length) {
            changedLog.push(`En eller flere perioder har blitt lagt til barn med ident - ${barn.ident}`);
        }
        if (barnInLatestOpplysninger.perioder.length < barn.perioder.length) {
            changedLog.push(`Det er minst en periode mindre i folkeregistre for barn med ident - ${barn.ident}`);
        }
        barn.perioder.forEach((periode, index) => {
            const periodeFraLatestOpplysninger = barnInLatestOpplysninger.perioder[index];
            if (periodeFraLatestOpplysninger) {
                if (
                    periode.periodeFra !== periodeFraLatestOpplysninger.periodeFra ||
                    periode.periodeTil !== periodeFraLatestOpplysninger.periodeTil
                ) {
                    changedLog.push(
                        `Datoene for en eller flere perioder har blitt endret for barn med ident - ${barn.ident}`
                    );
                }
                if (periode.boStatus !== periodeFraLatestOpplysninger.boStatus) {
                    changedLog.push(
                        `Bostatus for en eller flere perioder har blitt endret for barn med ident - ${barn.ident}`
                    );
                }
            }
        });
    });

    if (savedOpplysninger.sivilstand.length !== latestOpplysninger.sivilstand.length) {
        changedLog.push("Antall sivilstands perioder har blitt endret i folkeregisteret");
    } else {
        savedOpplysninger.sivilstand.forEach((periode, index) => {
            const periodeFraLatestOpplysninger = latestOpplysninger.sivilstand[index];
            if (periodeFraLatestOpplysninger.personId === periode.personId) {
                if (
                    periode.periodeFra !== periodeFraLatestOpplysninger.periodeFra ||
                    periode.periodeTil !== periodeFraLatestOpplysninger.periodeTil
                ) {
                    changedLog.push("Datoene for en eller flere sivilstand perioder har blitt endret");
                }
                if (periode.sivilstand !== periodeFraLatestOpplysninger.sivilstand) {
                    changedLog.push("Status for en eller flere sivilstand perioder har blitt endret");
                }
            }
        });
    }

    return changedLog;
};
