import { isLastDayOfMonth } from "@navikt/bidrag-ui-common";
import { UseFormSetValue } from "react-hook-form";

import { BoforholdResponse, BoStatusType, SivilstandDto } from "../../../api/BidragBehandlingApi";
import { RelatertPersonDto, SivilstandDto as SivilstandDtoGrunnlag } from "../../../api/BidragGrunnlagApi";
import {
    BarnPeriode,
    BoforholdFormValues,
    BoforholdOpplysninger,
    HusstandOpplysningFraFolkeRegistre,
    HusstandOpplysningPeriode,
    ParsedBoforholdOpplysninger,
    SavedOpplysningFraFolkeRegistrePeriode,
} from "../../../types/boforholdFormValues";
import {
    addDays,
    dateOrNull,
    deductDays,
    deductMonths,
    firstDayOfMonth,
    lastDayOfMonth,
    periodCoversMinOneFullCalendarMonth,
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

export const fillInPeriodGaps = (egneBarnIHusstanden: RelatertPersonDto) => {
    const perioder: HusstandOpplysningPeriode[] = [];
    const fodselsdato = dateOrNull(egneBarnIHusstanden.fodselsdato);
    let j = 0;
    egneBarnIHusstanden.borISammeHusstandDtoListe.forEach((periode, i) => {
        const prevPeriod = i !== 0 ? perioder[i - (1 + j)] : undefined;
        const prevPeriodIsRegistrert = prevPeriod?.boStatus === BoStatusType.REGISTRERT_PA_ADRESSE;
        const prevPeriodTilOrCurrentPeriodFraIsNull = prevPeriod?.tilDato === null || periode.periodeFra === null;
        const prevPeriodTilOrCurrentPeriodFraAreAdjacentDays =
            prevPeriod && addDays(prevPeriod.tilDato, 1).toDateString() === new Date(periode.periodeFra).toDateString();
        const firstPeriod = i === 0;
        const lastPeriod = i === egneBarnIHusstanden.borISammeHusstandDtoListe.length - 1;
        const fodselsDatoIsBeforePeriodeFra =
            fodselsdato && fodselsdato.getTime() < new Date(periode.periodeFra).getTime();

        if (
            prevPeriodIsRegistrert &&
            (prevPeriodTilOrCurrentPeriodFraIsNull || prevPeriodTilOrCurrentPeriodFraAreAdjacentDays)
        ) {
            prevPeriod.tilDato = dateOrNull(periode.periodeTil);
            j += 1;
        } else {
            if (firstPeriod && fodselsDatoIsBeforePeriodeFra) {
                perioder.push({
                    fraDato: fodselsdato,
                    tilDato: periode.periodeFra ? deductDays(new Date(periode.periodeFra), 1) : null,
                    boStatus: BoStatusType.IKKE_REGISTRERT_PA_ADRESSE,
                });
            }

            if (!firstPeriod && !prevPeriodTilOrCurrentPeriodFraAreAdjacentDays) {
                perioder.push({
                    fraDato: addDays(perioder[perioder.length - 1].tilDato, 1),
                    tilDato: deductDays(new Date(periode.periodeFra), 1),
                    boStatus: BoStatusType.IKKE_REGISTRERT_PA_ADRESSE,
                });
            }

            if (lastPeriod && periode.periodeTil && periode.periodeTil !== egneBarnIHusstanden.brukTil) {
                perioder.push({
                    fraDato: addDays(new Date(periode.periodeTil), 1),
                    tilDato: dateOrNull(egneBarnIHusstanden.brukTil),
                    boStatus: BoStatusType.IKKE_REGISTRERT_PA_ADRESSE,
                });
            }

            perioder.push({
                fraDato: dateOrNull(periode.periodeFra),
                tilDato: dateOrNull(periode.periodeTil),
                boStatus: BoStatusType.REGISTRERT_PA_ADRESSE,
            });
        }
    });
    return perioder.sort((a, b) => a.fraDato.getTime() - b.fraDato.getTime());
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

export const getBarnPerioder = (perioder: HusstandOpplysningPeriode[], virkningsOrSoktFraDato: Date) => {
    const perioderEtterVirkningstidspunkt = perioder?.filter(
        ({ tilDato }) => tilDato === null || (tilDato && tilDato > virkningsOrSoktFraDato)
    );

    const result: {
        boStatus: BoStatusType;
        kilde: "offentlig";
        datoFom: string;
        datoTom: string | null;
    }[] = [];
    perioderEtterVirkningstidspunkt?.forEach(({ fraDato, tilDato, boStatus }) => {
        const isRegistrertPeriode = boStatus === BoStatusType.REGISTRERT_PA_ADRESSE;
        const prevPeriode = result[result.length - 1];
        const datoFom = toISODateString(
            result.length === 0 ? virkningsOrSoktFraDato : addDays(new Date(result[result.length - 1].datoTom), 1)
        );
        const datoTom = toISODateString(tilDato ? lastDayOfMonth(tilDato) : tilDato);

        if (isRegistrertPeriode) {
            if (prevPeriode && prevPeriode.boStatus === BoStatusType.REGISTRERT_PA_ADRESSE) {
                result[result.length - 1].datoTom = datoTom;
            } else {
                result.push({
                    datoFom,
                    datoTom,
                    boStatus,
                    kilde: "offentlig",
                });
            }
        } else {
            const coversAtLeastOneCalendarMonth = tilDato
                ? periodCoversMinOneFullCalendarMonth(fraDato, tilDato)
                : true;

            if (coversAtLeastOneCalendarMonth) {
                result.push({
                    boStatus,
                    datoFom,
                    datoTom: tilDato
                        ? isLastDayOfMonth(tilDato)
                            ? toISODateString(tilDato)
                            : toISODateString(lastDayOfMonth(deductMonths(tilDato, 1)))
                        : null,
                    kilde: "offentlig",
                });
            }
        }
    });

    return result;
};
export const getBarnPerioderFromHusstandsListe = (
    opplysningerFraFolkRegistre: HusstandOpplysningFraFolkeRegistre[],
    virkningsOrSoktFraDato: Date
) => {
    return opplysningerFraFolkRegistre.map((barn) => ({
        ...barn,
        medISaken: true,
        perioder: getBarnPerioder(barn.perioder, virkningsOrSoktFraDato),
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
    boforhold: BoforholdResponse,
    opplysningerFraFolkRegistre: {
        husstand: HusstandOpplysningFraFolkeRegistre[];
        sivilstand: SivilstandDtoGrunnlag[];
    },
    virkningsOrSoktFraDato: Date
) => ({
    ...boforhold,
    husstandsBarn: boforhold?.husstandsBarn?.length
        ? boforhold.husstandsBarn
        : getBarnPerioderFromHusstandsListe(opplysningerFraFolkRegistre.husstand, virkningsOrSoktFraDato),
    sivilstand: boforhold?.sivilstand?.length
        ? boforhold.sivilstand
        : getSivilstandPerioder(opplysningerFraFolkRegistre.sivilstand, virkningsOrSoktFraDato),
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

export const checkOverlappingPeriods = (perioder: { datoFom?: string; datoTom?: string }[]) => {
    const overlappingPeriods = [];

    for (let i = 0; i < perioder.length; i++) {
        for (let j = i + 1; j < perioder.length; j++) {
            if (
                perioder[i].datoTom === null ||
                new Date(perioder[i].datoTom).getTime() >= new Date(perioder[j].datoFom).getTime()
            ) {
                overlappingPeriods.push([`${perioder[i].datoTom}`, `${perioder[j].datoFom}`]);
            }
        }
    }

    return overlappingPeriods;
};

export const editPeriods = (periods: BarnPeriode[], periodeIndex: number): BarnPeriode[] => {
    const editedPeriod = periods[periodeIndex];
    let startIndex = 0;
    let deleteCount = 0;

    const setPrevPeriod = (prevPeriod) => {
        const datoTom = toISODateString(deductDays(new Date(editedPeriod.datoFom), 1));
        const sameDate = datoTom === prevPeriod.datoTom;
        prevPeriod.datoTom = datoTom;
        prevPeriod.kilde = sameDate ? prevPeriod.kilde : "manuelt";
    };

    const setPostPeriod = (postPeriod) => {
        const datoFom = toISODateString(addDays(new Date(editedPeriod.datoTom), 1));
        const sameDate = datoFom === postPeriod.datoFom;
        postPeriod.datoFom = datoFom;
        postPeriod.kilde = sameDate ? postPeriod.kilde : "manuelt";
    };

    if (editedPeriod.datoTom === null) {
        const updatedPeriods = periods.filter(
            (period) => new Date(period.datoFom).getTime() <= new Date(editedPeriod.datoFom).getTime()
        );

        const prevPeriod = updatedPeriods[updatedPeriods.length - 2];

        if (prevPeriod) {
            const sameStatus = prevPeriod.boStatus === editedPeriod.boStatus;

            if (sameStatus) {
                prevPeriod.datoTom = editedPeriod.datoTom;
                prevPeriod.kilde = "manuelt";
                updatedPeriods.pop();
            } else {
                setPrevPeriod(prevPeriod);
            }
        }

        return updatedPeriods;
    }

    if (periodeIndex + 1 === periods.length) {
        periods.pop();
        const indexBeforeEditedPeriod = periods.findIndex(
            (period) => new Date(period.datoFom).getTime() < new Date(editedPeriod.datoFom).getTime()
        );
        const indexAfterEditedPeriod = periods.findIndex(
            (period) =>
                period.datoTom === null || new Date(period.datoTom).getTime() > new Date(editedPeriod.datoTom).getTime()
        );

        if (indexBeforeEditedPeriod !== -1) {
            startIndex = indexBeforeEditedPeriod + 1;
            const prevPeriod = periods[indexBeforeEditedPeriod];

            if (prevPeriod) {
                const sameStatus = prevPeriod.boStatus === editedPeriod.boStatus;

                if (sameStatus) {
                    startIndex -= 1;
                    deleteCount += 1;
                    editedPeriod.datoFom = prevPeriod.datoFom;
                } else {
                    setPrevPeriod(prevPeriod);
                }
            }
        }

        if (indexAfterEditedPeriod !== -1) {
            deleteCount = deleteCount + (indexAfterEditedPeriod - 1 - indexBeforeEditedPeriod);
            const postPeriod = periods[indexAfterEditedPeriod];

            if (postPeriod) {
                const sameStatus = postPeriod.boStatus === editedPeriod.boStatus;

                if (sameStatus) {
                    deleteCount += 1;
                    editedPeriod.datoTom = postPeriod.datoTom;
                } else {
                    setPostPeriod(postPeriod);
                }
            }
        }

        periods.splice(startIndex, deleteCount, editedPeriod);

        return periods;
    }

    const prevPeriod = periods[periodeIndex - 1];
    const postPeriod = periods[periodeIndex + 1];

    if (prevPeriod) {
        const sameStatus = prevPeriod.boStatus === editedPeriod.boStatus;

        if (sameStatus) {
            startIndex = periodeIndex - 1;
            deleteCount = 2;
            editedPeriod.datoFom = prevPeriod.datoFom;
        } else {
            setPrevPeriod(prevPeriod);
        }
    }

    if (postPeriod) {
        const sameStatus = postPeriod.boStatus === editedPeriod.boStatus;

        if (sameStatus) {
            deleteCount += 1;
        } else {
            setPostPeriod(postPeriod);
        }
    }

    if (deleteCount) {
        periods.splice(startIndex, deleteCount, editedPeriod);
    }

    return periods;
};

export const syncSivilstandDates = (
    periods: SivilstandDto[],
    date: string | null,
    periodeIndex: number,
    field: "datoFom" | "datoTom",
    setValue: UseFormSetValue<BoforholdFormValues>
) => {
    if (field === "datoFom" && periods[periodeIndex - 1] && date) {
        setValue(`sivilstand.${periodeIndex - 1}.datoTom`, toISODateString(deductDays(new Date(date), 1)));
    }
    if (field === "datoTom" && periods[periodeIndex + 1] && date) {
        setValue(`sivilstand.${periodeIndex + 1}.datoFom`, toISODateString(addDays(new Date(date), 1)));
    }
    setValue(`sivilstand.${periodeIndex}.${field}`, date);
};

export const compareOpplysninger = (
    savedOpplysninger: ParsedBoforholdOpplysninger,
    latestOpplysninger: BoforholdOpplysninger
) => {
    const changedLog = [];

    if (savedOpplysninger.husstand.length < latestOpplysninger.husstand.length) {
        changedLog.push("Det er flere barn registret på samme adresse i Folkeregisteret.");
    }
    if (savedOpplysninger.husstand.length > latestOpplysninger.husstand.length) {
        changedLog.push("Det er færre barn registrert på samme adresse i Folkeregisteret.");
    }

    const removed = savedOpplysninger.husstand?.filter(
        (b) => !latestOpplysninger.husstand?.some((barn) => barn.ident === b.ident)
    );

    const added = latestOpplysninger.husstand?.filter(
        (b) => !savedOpplysninger.husstand.some((barn) => barn.ident === b.ident)
    );

    if (added.length) {
        changedLog.push("Barn som har blitt lagt inn i nye opplysninger fra Folkeregisteret:");
        added.forEach((barn) => changedLog.push(`${barn.navn} / ${barn.ident}`));
    }

    if (removed.length) {
        changedLog.push("Barn som ikke finnes i nye opplysninger fra Folkeregisteret:");
        removed.forEach((barn) => changedLog.push(`${barn.navn} / ${barn.ident}`));
    }

    savedOpplysninger.husstand.forEach((barn) => {
        const barnInLatestOpplysninger = latestOpplysninger.husstand.find((b) => barn.ident === b.ident);
        const notTheSameNumberOfPeriods =
            barnInLatestOpplysninger && barnInLatestOpplysninger.perioder.length !== barn.perioder.length;
        const statusOrDatesChangedForSomePeriods = (perioder: SavedOpplysningFraFolkeRegistrePeriode[]) => {
            let changed = false;
            perioder.forEach((periode, index) => {
                const periodeFraLatestOpplysninger = barnInLatestOpplysninger?.perioder[index];
                if (periodeFraLatestOpplysninger) {
                    if (
                        toISODateString(dateOrNull(periode.fraDato)) !==
                            toISODateString(periodeFraLatestOpplysninger.fraDato) ||
                        toISODateString(dateOrNull(periode.tilDato)) !==
                            toISODateString(periodeFraLatestOpplysninger.tilDato) ||
                        periode.boStatus !== periodeFraLatestOpplysninger.boStatus
                    ) {
                        changed = true;
                    }
                }
            });

            return changed;
        };
        if (notTheSameNumberOfPeriods || statusOrDatesChangedForSomePeriods(barn.perioder)) {
            changedLog.push(`En eller flere perioder har blitt endret for barn med ident - ${barn.ident}`);
        }
    });

    const oneOrMoreSivilstandPeriodsChanged = (sivilstandPerioder: SivilstandDtoGrunnlag[]) => {
        let changed = false;
        sivilstandPerioder.forEach((periode, index) => {
            const periodeFraLatestOpplysninger = latestOpplysninger.sivilstand[index];
            if (periodeFraLatestOpplysninger && periodeFraLatestOpplysninger.personId === periode.personId) {
                if (
                    periode.periodeFra !== periodeFraLatestOpplysninger.periodeFra ||
                    periode.periodeTil !== periodeFraLatestOpplysninger.periodeTil ||
                    periode.sivilstand !== periodeFraLatestOpplysninger.sivilstand
                ) {
                    changed = true;
                }
            }
        });
        return changed;
    };

    if (savedOpplysninger.sivilstand.length !== latestOpplysninger.sivilstand.length) {
        changedLog.push("Antall sivilstandsperioder har blitt endret i Folkeregisteret");
    } else if (oneOrMoreSivilstandPeriodsChanged(savedOpplysninger.sivilstand)) {
        changedLog.push("En eller flere sivilstandsperioder har blitt endret");
    }

    return changedLog;
};
