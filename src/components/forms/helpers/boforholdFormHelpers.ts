import { firstDayOfMonth } from "@navikt/bidrag-ui-common";

import {
    BoforholdDto,
    Bostatuskode,
    HusstandsbarnDto,
    HusstandsbarnperiodeDto,
    Kilde,
    OppdaterBehandlingRequest,
    SivilstandDto,
    Sivilstandskode,
} from "../../../api/BidragBehandlingApiV1";
import {
    RelatertPersonDto,
    SivilstandDto as SivilstandDtoGrunnlag,
    SivilstandskodePDL,
} from "../../../api/BidragGrunnlagApi";
import {
    BoforholdFormValues,
    BoforholdOpplysninger,
    HusstandOpplysningFraFolkeRegistre,
    HusstandOpplysningPeriode,
    ParsedBoforholdOpplysninger,
    SavedOpplysningFraFolkeRegistrePeriode,
    SivilstandOpplysninger,
} from "../../../types/boforholdFormValues";
import {
    addDays,
    dateOrNull,
    deductDays,
    deductMonths,
    isAfterDate,
    lastDayOfMonth,
    periodCoversMinOneFullCalendarMonth,
    toISODateString,
} from "../../../utils/date-utils";

export const boforholdForskuddOptions = {
    under18År: [Bostatuskode.MED_FORELDER, Bostatuskode.IKKE_MED_FORELDER],
    likEllerOver18År: [Bostatuskode.REGNES_IKKE_SOM_BARN, Bostatuskode.DOKUMENTERT_SKOLEGANG],
};
export const sivilstandForskuddOptions = [Sivilstandskode.GIFT_SAMBOER, Sivilstandskode.BOR_ALENE_MED_BARN];
export const calculateFraDato = (
    fieldArrayValues: HusstandsbarnperiodeDto[] | SivilstandDto[],
    virkningstidspunkt: Date
) => {
    if (
        fieldArrayValues.length &&
        !fieldArrayValues.some((periode: HusstandsbarnperiodeDto | SivilstandDto) => periode.datoTom === null)
    ) {
        const filtrertOgSorterListe = fieldArrayValues.sort(
            (a: HusstandsbarnperiodeDto | SivilstandDto, b: HusstandsbarnperiodeDto | SivilstandDto) => {
                if (a.datoTom == null || b.datoTom == null) {
                    return a.datoTom == null ? 1 : -1;
                }
                return new Date(a.datoTom).getTime() - new Date(b.datoTom).getTime();
            }
        );
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
    egneBarnIHusstanden.borISammeHusstandDtoListe.forEach((periode, i) => {
        const firstPeriod = i === 0;
        const lastPeriod = i === egneBarnIHusstanden.borISammeHusstandDtoListe.length - 1;
        const fodselsDatoIsBeforePeriodeFra =
            periode.periodeFra && periode.periodeFra !== egneBarnIHusstanden.fodselsdato
                ? isAfterDate(periode.periodeFra, fodselsdato)
                : false;

        if (firstPeriod && fodselsDatoIsBeforePeriodeFra) {
            perioder.push({
                fraDato: fodselsdato,
                tilDato: deductDays(new Date(periode.periodeFra), 1),
                bostatus: Bostatuskode.IKKE_MED_FORELDER,
            });
        }

        const prevPeriod = perioder[perioder.length - 1];
        const gapBetweenPeriods =
            periode.periodeFra && prevPeriod?.tilDato
                ? isAfterDate(periode.periodeFra, addDays(new Date(prevPeriod.tilDato), 1))
                : false;
        const prevPeriodIsRegistrert = prevPeriod?.bostatus === Bostatuskode.MED_FORELDER;

        if (gapBetweenPeriods) {
            perioder.push({
                fraDato: addDays(new Date(prevPeriod.tilDato), 1),
                tilDato: deductDays(new Date(periode.periodeFra), 1),
                bostatus: Bostatuskode.IKKE_MED_FORELDER,
            });
        }

        if (prevPeriodIsRegistrert && !gapBetweenPeriods) {
            prevPeriod.tilDato =
                periode?.periodeTil && prevPeriod.tilDato
                    ? isAfterDate(periode.periodeTil, prevPeriod.tilDato)
                        ? new Date(periode.periodeTil)
                        : new Date(prevPeriod.tilDato)
                    : null;
        } else {
            perioder.push({
                fraDato: periode.periodeFra ? dateOrNull(periode.periodeFra) : fodselsdato,
                tilDato: dateOrNull(periode.periodeTil),
                bostatus: Bostatuskode.MED_FORELDER,
            });
        }

        if (lastPeriod && periode.periodeTil) {
            perioder.push({
                fraDato: addDays(new Date(periode.periodeTil), 1),
                tilDato: null,
                bostatus: Bostatuskode.IKKE_MED_FORELDER,
            });
        }
    });
    return perioder.sort((a, b) => a.fraDato.getTime() - b.fraDato.getTime());
};

export const mapHusstandsMedlemmerToBarn = (husstandmedlemmerOgEgneBarnListe: RelatertPersonDto[]) => {
    return husstandmedlemmerOgEgneBarnListe
        .filter((medlem) => medlem.erBarnAvBmBp)
        .map((barn) => ({
            foedselsdato: barn.fodselsdato,
            ident: barn.relatertPersonPersonId,
            navn: barn.navn,
            perioder: fillInPeriodGaps(barn),
        }));
};

const getSivilstandType = (sivilstand: SivilstandskodePDL): Sivilstandskode => {
    if ([SivilstandskodePDL.GIFT, SivilstandskodePDL.REGISTRERT_PARTNER].includes(sivilstand)) {
        return Sivilstandskode.GIFT_SAMBOER;
    }
    return Sivilstandskode.BOR_ALENE_MED_BARN;
};

export const mapGrunnlagSivilstandToBehandlingSivilstandType = (
    sivilstandListe: SivilstandDtoGrunnlag[]
): SivilstandOpplysninger[] => {
    return sivilstandListe.map((sivilstand) => ({
        datoFom: sivilstand.periodeFra,
        datoTom: sivilstand.periodeTil,
        sivilstand: getSivilstandType(sivilstand.sivilstand),
    }));
};

export const getEitherFirstDayOfFoedselsOrVirkingsdatoMonth = (
    barnsFoedselsDato: Date | string,
    virkningsOrSoktFraDato: Date
) => {
    const date =
        barnsFoedselsDato && isAfterDate(barnsFoedselsDato, virkningsOrSoktFraDato)
            ? new Date(barnsFoedselsDato)
            : virkningsOrSoktFraDato;

    return firstDayOfMonth(date);
};

export const getBarnPerioder = (
    perioder: HusstandOpplysningPeriode[] | SavedOpplysningFraFolkeRegistrePeriode[],
    virkningsOrSoktFraDato: Date,
    barnsFoedselsDato: string
) => {
    const datoFra = getEitherFirstDayOfFoedselsOrVirkingsdatoMonth(barnsFoedselsDato, virkningsOrSoktFraDato);
    const perioderEtterVirkningstidspunkt = perioder?.filter(
        ({ tilDato }) => tilDato === null || (tilDato && isAfterDate(tilDato, datoFra))
    );

    const result: {
        bostatus: Bostatuskode;
        kilde: Kilde;
        datoFom: string;
        datoTom: string | null;
    }[] = [];
    perioderEtterVirkningstidspunkt?.forEach(({ fraDato, tilDato, bostatus: bostatus }) => {
        const isRegistrertPeriode = bostatus === Bostatuskode.MED_FORELDER;
        const prevPeriode = result[result.length - 1];
        const datoFom = toISODateString(
            result.length === 0 ? datoFra : addDays(new Date(result[result.length - 1].datoTom), 1)
        );
        const datoTom = tilDato ? toISODateString(lastDayOfMonth(new Date(tilDato))) : null;

        if (isRegistrertPeriode) {
            if (prevPeriode && prevPeriode.bostatus === Bostatuskode.MED_FORELDER) {
                result[result.length - 1].datoTom = datoTom;
            } else {
                result.push({
                    datoFom,
                    datoTom,
                    bostatus,
                    kilde: Kilde.OFFENTLIG,
                });
            }
        } else {
            const coversAtLeastOneCalendarMonth = tilDato
                ? periodCoversMinOneFullCalendarMonth(new Date(fraDato), new Date(tilDato))
                : true;

            if (coversAtLeastOneCalendarMonth) {
                result.push({
                    bostatus,
                    datoFom,
                    datoTom: tilDato ? toISODateString(new Date(tilDato)) : null,
                    kilde: Kilde.OFFENTLIG,
                });
            }
        }
    });

    return result;
};
const periodIsAfterVirkningstidspunkt =
    (virkningsOrSoktFraDato: Date) =>
    ({ datoTom }: { datoTom: string }) =>
        datoTom === null || (datoTom && isAfterDate(datoTom, virkningsOrSoktFraDato));
export const getSivilstandPerioder = (
    sivilstandListe: SivilstandOpplysninger[],
    virkningsOrSoktFraDato: Date
): SivilstandDto[] => {
    const perioderEtterVirkningstidspunkt = sivilstandListe?.filter(
        periodIsAfterVirkningstidspunkt(virkningsOrSoktFraDato)
    );

    const result: {
        sivilstand: Sivilstandskode;
        kilde: Kilde;
        datoFom: string;
        datoTom: string | null;
    }[] = [];
    perioderEtterVirkningstidspunkt?.forEach(({ datoTom, sivilstand }) => {
        const prevPeriode = result[result.length - 1];
        const hasSameStatus = prevPeriode?.sivilstand === sivilstand;
        const coversAtLeastOneCalendarMonth = datoTom
            ? periodCoversMinOneFullCalendarMonth(new Date(datoTom), new Date(datoTom))
            : true;
        const tilDato = coversAtLeastOneCalendarMonth
            ? toISODateString(dateOrNull(datoTom))
            : toISODateString(lastDayOfMonth(deductMonths(new Date(datoTom), 1)));

        if (hasSameStatus) {
            prevPeriode.datoTom = tilDato;
        }

        if (!hasSameStatus) {
            result.push({
                sivilstand,
                datoFom: toISODateString(
                    result.length === 0
                        ? virkningsOrSoktFraDato
                        : addDays(new Date(result[result.length - 1].datoTom), 1)
                ),
                datoTom: tilDato,
                kilde: Kilde.OFFENTLIG,
            });
        }
    });

    return result;
};
export const getBarnPerioderFromHusstandsListe = (
    opplysningerFraFolkRegistre: HusstandOpplysningFraFolkeRegistre[],
    virkningsOrSoktFraDato: Date
): HusstandsbarnDto[] => {
    return opplysningerFraFolkRegistre.map((barn) => ({
        ...barn,
        fødselsdato: barn.foedselsdato,
        medISak: true,
        perioder: getBarnPerioder(barn.perioder, virkningsOrSoktFraDato, barn.foedselsdato),
    }));
};

export const createInitialValues = (
    boforhold: BoforholdDto,
    opplysningerFraFolkRegistre: {
        husstand: HusstandOpplysningFraFolkeRegistre[];
        sivilstand: SivilstandOpplysninger[];
    },
    virkningsOrSoktFraDato: Date
) => {
    return {
        ...boforhold,
        husstandsbarn: boforhold?.husstandsbarn?.length
            ? boforhold.husstandsbarn
            : getBarnPerioderFromHusstandsListe(opplysningerFraFolkRegistre.husstand, virkningsOrSoktFraDato),
        sivilstand: boforhold?.sivilstand?.length
            ? boforhold.sivilstand
            : getSivilstandPerioder(opplysningerFraFolkRegistre.sivilstand, virkningsOrSoktFraDato),
    };
};

export const createPayload = (values: BoforholdFormValues): OppdaterBehandlingRequest => ({
    boforhold: {
        ...values,
        husstandsbarn: values.husstandsbarn,
        sivilstand: values.sivilstand,
    },
});

export const checkOverlappingPeriods = (perioder: { datoFom?: string; datoTom?: string }[]) => {
    const overlappingPeriods = [];

    for (let i = 0; i < perioder.length; i++) {
        for (let j = i + 1; j < perioder.length; j++) {
            if (
                perioder[i].datoTom === null ||
                (perioder[i].datoTom && isAfterDate(perioder[i].datoTom, perioder[j].datoFom))
            ) {
                overlappingPeriods.push([`${perioder[i].datoTom}`, `${perioder[j].datoFom}`]);
            }
        }
    }

    return overlappingPeriods;
};

function returnTypedPeriods(periodsList: HusstandsbarnperiodeDto[]): HusstandsbarnperiodeDto[];
function returnTypedPeriods(periodsList: SivilstandDto[]): SivilstandDto[];
function returnTypedPeriods(
    periodsList: HusstandsbarnperiodeDto[] | SivilstandDto[]
): HusstandsbarnperiodeDto[] | SivilstandDto[] {
    return periodsList;
}
export function editPeriods(periodsList: HusstandsbarnperiodeDto[], periodeIndex: number): HusstandsbarnperiodeDto[];
export function editPeriods(periodsList: SivilstandDto[], periodeIndex: number): SivilstandDto[];
export function editPeriods(
    periodsList: HusstandsbarnperiodeDto[] | SivilstandDto[],
    periodeIndex: number
): HusstandsbarnperiodeDto[] | SivilstandDto[] {
    const editedPeriod = { ...periodsList[periodeIndex], kilde: Kilde.MANUELL };
    const statusField = Object.hasOwn(periodsList[0], "bostatus") ? "bostatus" : "sivilstand";

    const periods = periodsList.toSpliced(periodeIndex, 1);
    let startIndex = periods.filter(
        (period) => new Date(period.datoFom).getTime() < new Date(editedPeriod.datoFom).getTime()
    ).length;

    const postPeriodIndex = editedPeriod.datoTom
        ? periods.findIndex(
              (period: HusstandsbarnperiodeDto | SivilstandDto) =>
                  period.datoTom === null || (period.datoTom && isAfterDate(period.datoTom, editedPeriod.datoTom))
          )
        : -1;

    let deleteCount = postPeriodIndex === -1 ? periods.length - startIndex : postPeriodIndex - startIndex;

    const prevPeriodIndex = startIndex ? startIndex - 1 : 0;
    const prevPeriod = startIndex ? periods[prevPeriodIndex] : undefined;
    const postPeriod = postPeriodIndex !== -1 ? periods[postPeriodIndex] : undefined;
    const existingPeriodCoversWholeEditedPeriod = prevPeriodIndex === postPeriodIndex;

    if (periodeIndex && existingPeriodCoversWholeEditedPeriod) {
        const sameStatus = prevPeriod && prevPeriod[statusField] === editedPeriod[statusField];

        if (sameStatus) {
            return periods;
        } else {
            const periodsToEdit = [
                {
                    datoFom: prevPeriod.datoFom,
                    datoTom: toISODateString(deductDays(new Date(editedPeriod.datoFom), 1)),
                    [statusField]: prevPeriod[statusField],
                    kilde: Kilde.MANUELL,
                },
                editedPeriod,
                {
                    datoFom: toISODateString(addDays(new Date(editedPeriod.datoTom), 1)),
                    datoTom: prevPeriod.datoTom,
                    [statusField]: prevPeriod[statusField],
                    kilde: Kilde.MANUELL,
                },
            ];

            if (statusField === "bostatus") {
                return periods.toSpliced(
                    prevPeriodIndex,
                    1,
                    ...returnTypedPeriods(periodsToEdit as HusstandsbarnperiodeDto[])
                );
            }

            if (statusField === "sivilstand") {
                return periods.toSpliced(prevPeriodIndex, 1, ...returnTypedPeriods(periodsToEdit as SivilstandDto[]));
            }
        }
    }

    if (prevPeriod) {
        const sameStatus = editedPeriod[statusField] === prevPeriod[statusField];

        if (sameStatus) {
            startIndex -= 1;
            deleteCount += 1;
            editedPeriod.datoFom = prevPeriod.datoFom;
        } else {
            const editedPeriodDatoFomMinusOneDay = toISODateString(deductDays(new Date(editedPeriod.datoFom), 1));
            const adjacentDates = editedPeriodDatoFomMinusOneDay === prevPeriod.datoTom;
            prevPeriod.datoTom = editedPeriodDatoFomMinusOneDay;
            prevPeriod.kilde = adjacentDates ? prevPeriod.kilde : Kilde.MANUELL;
        }
    }

    if (postPeriod) {
        const sameStatus = editedPeriod[statusField] === postPeriod[statusField];

        if (sameStatus) {
            deleteCount += 1;
            editedPeriod.datoTom = postPeriod.datoTom;
        } else {
            const editedPeriodDatoTomPlusOneDay = toISODateString(addDays(new Date(editedPeriod.datoTom), 1));
            const adjacentDates = editedPeriodDatoTomPlusOneDay === postPeriod.datoFom;
            postPeriod.datoFom = editedPeriodDatoTomPlusOneDay;
            postPeriod.kilde = adjacentDates ? postPeriod.kilde : Kilde.MANUELL;
        }
    }

    if (statusField === "bostatus") {
        return periods.toSpliced(startIndex, deleteCount, editedPeriod as HusstandsbarnperiodeDto);
    }

    if (statusField === "sivilstand") {
        return periods.toSpliced(startIndex, deleteCount, editedPeriod as SivilstandDto);
    }
}

export function removeAndEditPeriods(periodsList: HusstandsbarnperiodeDto[], index: number): HusstandsbarnperiodeDto[];
export function removeAndEditPeriods(periodsList: SivilstandDto[], index: number): SivilstandDto[];
export function removeAndEditPeriods(
    periodsList: HusstandsbarnperiodeDto[] | SivilstandDto[],
    index: number
): HusstandsbarnperiodeDto[] | SivilstandDto[] {
    const periodToRemove = periodsList[index];
    const prevPeriod = periodsList[index - 1];
    const postPeriod = periodsList[index + 1];

    prevPeriod.datoTom = postPeriod ? postPeriod.datoTom : null;
    prevPeriod.kilde = Kilde.MANUELL;

    if ("bostatus" in periodToRemove) {
        return periodsList.filter((_, i) => i !== index && i !== index + 1) as HusstandsbarnperiodeDto[];
    }

    if ("sivilstand" in periodToRemove) {
        return periodsList.filter((_, i) => i !== index && i !== index + 1) as SivilstandDto[];
    }
}

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
                        periode.bostatus !== periodeFraLatestOpplysninger.bostatus
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

    const oneOrMoreSivilstandPeriodsChanged = (sivilstandPerioder: SivilstandOpplysninger[]) => {
        let changed = false;
        sivilstandPerioder.forEach((periode, index) => {
            const periodeFraLatestOpplysninger = latestOpplysninger.sivilstand[index];
            if (periodeFraLatestOpplysninger) {
                if (
                    periode.datoFom !== periodeFraLatestOpplysninger.datoFom ||
                    periode.datoTom !== periodeFraLatestOpplysninger.datoTom ||
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
