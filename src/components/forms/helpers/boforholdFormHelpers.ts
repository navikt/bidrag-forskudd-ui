import { isLastDayOfMonth } from "@navikt/bidrag-ui-common";
import { UseFormSetValue } from "react-hook-form";

import { BoforholdResponse, BoStatusType, SivilstandDto, SivilstandType } from "../../../api/BidragBehandlingApi";
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
            foedselsDato: barn.fodselsdato,
            ident: barn.relatertPersonPersonId,
            navn: barn.navn,
            perioder: fillInPeriodGaps(barn),
        }));
};

const getSivilstandType = (
    sivilstand:
        | "GIFT"
        | "UGIFT"
        | "ENSLIG"
        | "SAMBOER"
        | "UOPPGITT"
        | "ENKE_ELLER_ENKEMANN"
        | "SKILT"
        | "SEPARERT"
        | "REGISTRERT_PARTNER"
        | "SEPARERT_PARTNER"
        | "SKILT_PARTNER"
        | "GJENLEVENDE_PARTNER"
): SivilstandType => {
    if (sivilstand === "GIFT" || sivilstand === "SAMBOER") {
        return SivilstandType.GIFT;
    }
    return SivilstandType.BOR_ALENE_MED_BARN;
};

export const mapGrunnlagSivilstandToBehandlingSivilstandType = (
    sivilstandListe: SivilstandDtoGrunnlag[]
): SivilstandDto[] => {
    return sivilstandListe.map((sivilstand) => ({
        datoFom: sivilstand.periodeFra,
        datoTom: sivilstand.periodeTil,
        sivilstandType: getSivilstandType(sivilstand.sivilstand),
    }));
};

export const getBarnPerioder = (perioder: HusstandOpplysningPeriode[], virkningsOrSoktFraDato: Date) => {
    const perioderEtterVirkningstidspunkt = perioder?.filter(
        ({ tilDato }) => tilDato === null || (tilDato && new Date(tilDato) > virkningsOrSoktFraDato)
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
        const datoTom = tilDato ? toISODateString(lastDayOfMonth(new Date(tilDato))) : null;

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
                ? periodCoversMinOneFullCalendarMonth(new Date(fraDato), new Date(tilDato))
                : true;

            if (coversAtLeastOneCalendarMonth) {
                result.push({
                    boStatus,
                    datoFom,
                    datoTom: tilDato
                        ? isLastDayOfMonth(new Date(tilDato))
                            ? toISODateString(new Date(tilDato))
                            : toISODateString(lastDayOfMonth(deductMonths(new Date(tilDato), 1)))
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

export const getSivilstandPerioder = (sivilstandListe: SivilstandDto[], datoFom: Date): SivilstandDto[] => {
    // Sometimes one person can have multiple running sivisltand with periodeTil = null. Adjust the data to have correct periodeTil
    const sivilstandListeWithValidPeriodeTil = sivilstandListe
        .map((periodeA) => {
            if (periodeA.datoTom == null && periodeA.datoFom != null) {
                const nextPeriode = sivilstandListe.find(
                    (periodeB) => periodeB.datoTom == null && new Date(periodeA.datoFom) < new Date(periodeB.datoFom)
                );
                return {
                    ...periodeA,
                    periodeTil: nextPeriode?.datoFom
                        ? lastDayOfMonth(deductMonths(new Date(nextPeriode.datoFom), 1))
                        : null,
                };
            }
            return periodeA;
        })
        .filter(
            (periode) =>
                periode?.datoFom === null || periode?.datoTom === null || new Date(periode.datoTom) > new Date(datoFom)
        );

    //@ts-ignore
    return sivilstandListeWithValidPeriodeTil
        .map((periode) => {
            const periodDatoFom =
                periode.datoFom != null
                    ? new Date(periode.datoFom) < new Date(datoFom)
                        ? datoFom
                        : new Date(periode.datoFom)
                    : null;
            return {
                sivilstandType: periode.sivilstandType,
                datoFom: periodDatoFom != null ? toISODateString(firstDayOfMonth(periodDatoFom)) : null,
                datoTom: periode.datoTom != null ? toISODateString(new Date(periode.datoTom)) : null,
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
        sivilstand: SivilstandDto[];
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

export const editPeriods = (periodsList: BarnPeriode[], periodeIndex: number): BarnPeriode[] => {
    const periods = [...periodsList];
    const editedPeriod = { ...periods[periodeIndex], kilde: "manuelt" };
    periods.splice(periodeIndex, 1);
    let startIndex = periods.filter(
        (period) => new Date(period.datoFom).getTime() < new Date(editedPeriod.datoFom).getTime()
    ).length;
    const postPeriodIndex = editedPeriod.datoTom
        ? periods.findIndex(
              (period) =>
                  period.datoTom === null ||
                  new Date(period.datoTom).getTime() > new Date(editedPeriod.datoTom).getTime()
          )
        : -1;

    let deleteCount = postPeriodIndex === -1 ? periods.length - startIndex : postPeriodIndex - startIndex;

    const prevPeriodIndex = startIndex ? startIndex - 1 : 0;
    const prevPeriod = startIndex ? periods[prevPeriodIndex] : undefined;
    const postPeriod = postPeriodIndex !== -1 ? periods[postPeriodIndex] : undefined;
    const existingPeriodCoversWholeEditedPeriod = prevPeriodIndex === postPeriodIndex;

    if (existingPeriodCoversWholeEditedPeriod) {
        const sameStatus = prevPeriod.boStatus === editedPeriod.boStatus;

        if (sameStatus) {
            return periods;
        } else {
            periods.splice(
                prevPeriodIndex,
                1,
                {
                    datoFom: prevPeriod.datoFom,
                    datoTom: toISODateString(deductDays(new Date(editedPeriod.datoFom), 1)),
                    boStatus: prevPeriod.boStatus,
                    kilde: "manuelt",
                },
                editedPeriod,
                {
                    datoFom: toISODateString(addDays(new Date(editedPeriod.datoTom), 1)),
                    datoTom: prevPeriod.datoTom,
                    boStatus: prevPeriod.boStatus,
                    kilde: "manuelt",
                }
            );
            return periods;
        }
    }

    if (prevPeriod) {
        const sameStatus = editedPeriod.boStatus === prevPeriod.boStatus;

        if (sameStatus) {
            startIndex -= 1;
            deleteCount += 1;
            editedPeriod.datoFom = prevPeriod.datoFom;
        } else {
            const editedPeriodDatoFomMinusOneDay = toISODateString(deductDays(new Date(editedPeriod.datoFom), 1));
            const adjacentDates = editedPeriodDatoFomMinusOneDay === prevPeriod.datoTom;
            prevPeriod.datoTom = editedPeriodDatoFomMinusOneDay;
            prevPeriod.kilde = adjacentDates ? prevPeriod.kilde : "manuelt";
        }
    }

    if (postPeriod) {
        const sameStatus = editedPeriod.boStatus === postPeriod.boStatus;

        if (sameStatus) {
            deleteCount += 1;
            editedPeriod.datoTom = postPeriod.datoTom;
        } else {
            const editedPeriodDatoTomPlusOneDay = toISODateString(addDays(new Date(editedPeriod.datoTom), 1));
            const adjacentDates = editedPeriodDatoTomPlusOneDay === postPeriod.datoFom;
            postPeriod.datoFom = editedPeriodDatoTomPlusOneDay;
            postPeriod.kilde = adjacentDates ? postPeriod.kilde : "manuelt";
        }
    }

    periods.splice(startIndex, deleteCount, editedPeriod);

    return periods;
};

const getPreAndPostPeriods = (periodsList, periodeIndex) => {
    const periods = [...periodsList];
    const editedPeriod = { ...periods[periodeIndex] };
    periods.splice(periodeIndex, 1);
    const startIndex = periods.filter(
        (period) => new Date(period.datoFom).getTime() < new Date(editedPeriod.datoFom).getTime()
    ).length;
    const postPeriodIndex = editedPeriod.datoTom
        ? periods.findIndex(
              (period) =>
                  period.datoTom === null ||
                  new Date(period.datoTom).getTime() > new Date(editedPeriod.datoTom).getTime()
          )
        : -1;

    const deleteCount = postPeriodIndex === -1 ? periods.length - startIndex : postPeriodIndex - startIndex;

    const prevPeriodIndex = startIndex ? startIndex - 1 : 0;
    const prevPeriod = startIndex ? periods[prevPeriodIndex] : undefined;
    const postPeriod = postPeriodIndex !== -1 ? periods[postPeriodIndex] : undefined;

    return { prevPeriod, editedPeriod, periods, prevPeriodIndex, postPeriodIndex, startIndex, deleteCount, postPeriod };
};

export const editSivilstandPeriods = (periodsList: SivilstandDto[], periodeIndex: number): SivilstandDto[] => {
    const {
        prevPeriod,
        editedPeriod,
        periods,
        prevPeriodIndex,
        postPeriodIndex,
        startIndex: sIndex,
        deleteCount: dCount,
        postPeriod,
    } = getPreAndPostPeriods(periodsList, periodeIndex);

    let startIndex = sIndex;
    let deleteCount = dCount;
    const sameStatus = prevPeriod?.sivilstandType === editedPeriod.sivilstandType;

    if (prevPeriodIndex === postPeriodIndex) {
        if (sameStatus) {
            return periods;
        } else {
            periods.splice(
                prevPeriodIndex,
                1,
                {
                    datoFom: prevPeriod.datoFom,
                    datoTom: toISODateString(deductDays(new Date(editedPeriod.datoFom), 1)),
                    sivilstandType: prevPeriod.sivilstandType,
                },
                editedPeriod,
                {
                    datoFom: toISODateString(addDays(new Date(editedPeriod.datoTom), 1)),
                    datoTom: prevPeriod.datoTom,
                    sivilstandType: prevPeriod.sivilstandType,
                }
            );
            return periods;
        }
    }

    if (prevPeriod) {
        if (sameStatus) {
            startIndex -= 1;
            deleteCount += 1;
            editedPeriod.datoFom = prevPeriod.datoFom;
        } else {
            const editedPeriodDatoFomMinusOneDay = toISODateString(deductDays(new Date(editedPeriod.datoFom), 1));
            prevPeriod.datoTom = editedPeriodDatoFomMinusOneDay;
        }
    }

    if (postPeriod) {
        const sameStatus = editedPeriod.sivilstandType === postPeriod.sivilstandType;

        if (sameStatus) {
            deleteCount += 1;
            editedPeriod.datoTom = postPeriod.datoTom;
        } else {
            const editedPeriodDatoTomPlusOneDay = toISODateString(addDays(new Date(editedPeriod.datoTom), 1));
            postPeriod.datoFom = editedPeriodDatoTomPlusOneDay;
        }
    }

    periods.splice(startIndex, deleteCount, editedPeriod);

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

    const oneOrMoreSivilstandPeriodsChanged = (sivilstandPerioder: SivilstandDto[]) => {
        let changed = false;
        sivilstandPerioder.forEach((periode, index) => {
            const periodeFraLatestOpplysninger = latestOpplysninger.sivilstand[index];
            if (periodeFraLatestOpplysninger) {
                if (
                    periode.datoFom !== periodeFraLatestOpplysninger.datoFom ||
                    periode.datoTom !== periodeFraLatestOpplysninger.datoTom ||
                    periode.sivilstandType !== periodeFraLatestOpplysninger.sivilstandType
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
