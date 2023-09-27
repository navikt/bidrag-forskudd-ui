import { UseFormSetValue } from "react-hook-form";

import { BehandlingDto, BoforholdResponse, BoStatusType, SivilstandDto } from "../../../api/BidragBehandlingApi";
import {
    HentGrunnlagspakkeDto,
    RelatertPersonDto,
    SivilstandDto as SivilstandDtoGrunnlag,
} from "../../../api/BidragGrunnlagApi";
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
    deductMonths,
    firstDayOfMonth,
    lastDayOfMonth,
    toISODateString,
} from "../../../utils/date-utils";

export const calculateFraDato = (fieldArrayValues: BarnPeriode[] | SivilstandDto[], virkningstidspunkt: Date) => {
    if (fieldArrayValues.length && !fieldArrayValues.some((periode) => periode.datoTom === null)) {
        const filtrertOgSorterListe = fieldArrayValues.sort((a, b) => {
            if (a.datoTom == null || b.datoTom == null) {
                return a.datoTom == null ? 1 : -1;
            }
            return new Date(a.datoTom).getTime() - new Date(b.datoTom).getTime();
        });
        const lastDatoTom = filtrertOgSorterListe[filtrertOgSorterListe.length - 1].datoTom;
        return lastDatoTom == null ? null : toISODateString(addDays(new Date(lastDatoTom), 1));
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

export const getSivilstandPerioder = (sivilstandListe: SivilstandDtoGrunnlag[], datoFom: Date): SivilstandDto[] => {
    // Sometimes one person can have multiple running sivisltand with periodeTil = null. Adjust the data to have correct periodeTil
    const sivilstandListeWithValidPeriodeTil = sivilstandListe
        .map((periodeA) => {
            if (periodeA.periodeTil == null && periodeA.periodeFra != null) {
                const nextPeriode = sivilstandListe.find(
                    (periodeB) =>
                        periodeB.periodeTil == null && new Date(periodeA.periodeFra) < new Date(periodeB.periodeFra)
                );
                return {
                    ...periodeA,
                    periodeTil: nextPeriode?.periodeFra
                        ? lastDayOfMonth(deductMonths(new Date(nextPeriode.periodeFra), 1))
                        : null,
                };
            }
            return periodeA;
        })
        .filter(
            (periode) =>
                periode?.periodeFra === null ||
                periode?.periodeTil === null ||
                new Date(periode.periodeTil) > new Date(datoFom)
        );

    //@ts-ignore
    return sivilstandListeWithValidPeriodeTil
        .map((periode) => {
            const periodDatoFom =
                periode.periodeFra != null
                    ? new Date(periode.periodeFra) < new Date(datoFom)
                        ? datoFom
                        : new Date(periode.periodeFra)
                    : null;
            return {
                sivilstandType: periode.sivilstand,
                datoFom: periodDatoFom != null ? toISODateString(firstDayOfMonth(periodDatoFom)) : null,
                datoTom: periode.periodeTil != null ? toISODateString(new Date(periode.periodeTil)) : null,
            };
        })
        .sort((periodeA, periodeB) =>
            periodeB.datoFom == null ? 1 : new Date(periodeA.datoFom) > new Date(periodeB.datoFom) ? 1 : -1
        );
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
        ? boforhold.husstandsBarn.map((barn) => ({
              ...barn,
              perioder: barn.perioder?.sort((a, b) => (new Date(a.datoFom) > new Date(b.datoFom) ? 1 : -1)),
          }))
        : getBarnPerioderFromHusstandsListe(opplysningerFraFolkRegistre, datoFom),
    sivilstand: boforhold?.sivilstand?.length
        ? boforhold.sivilstand?.sort((a, b) => (new Date(a.datoFom) > new Date(b.datoFom) ? 1 : -1))
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
