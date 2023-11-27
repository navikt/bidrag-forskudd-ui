import {
    BoforholdResponse,
    Bostatuskode,
    HusstandsBarnPeriodeDto,
    Kilde,
    SivilstandDto,
    Sivilstandskode,
} from "../../../api/BidragBehandlingApi";
import { RelatertPersonDto, SivilstandDto as SivilstandDtoGrunnlag } from "../../../api/BidragGrunnlagApi";
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
    fieldArrayValues: HusstandsBarnPeriodeDto[] | SivilstandDto[],
    virkningstidspunkt: Date
) => {
    if (
        fieldArrayValues.length &&
        !fieldArrayValues.some((periode: HusstandsBarnPeriodeDto | SivilstandDto) => periode.datoTom === null)
    ) {
        const filtrertOgSorterListe = fieldArrayValues.sort(
            (a: HusstandsBarnPeriodeDto | SivilstandDto, b: HusstandsBarnPeriodeDto | SivilstandDto) => {
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
    let j = 0;
    egneBarnIHusstanden.borISammeHusstandDtoListe.forEach((periode, i) => {
        const prevPeriod = i !== 0 ? perioder[i - (1 + j)] : undefined;
        const prevPeriodIsRegistrert = prevPeriod?.bostatus === Bostatuskode.MED_FORELDER;
        const prevPeriodTilOrCurrentPeriodFraIsNull =
            (prevPeriod && prevPeriod.tilDato === null) || periode.periodeFra === null;
        const prevPeriodTilOrCurrentPeriodFraAreAdjacentDays =
            prevPeriod && addDays(prevPeriod.tilDato, 1).toDateString() === new Date(periode.periodeFra).toDateString();
        const firstPeriod = i === 0;
        const lastPeriod = i === egneBarnIHusstanden.borISammeHusstandDtoListe.length - 1;
        const fodselsDatoIsBeforePeriodeFra = periode.periodeFra
            ? fodselsdato && isAfterDate(periode.periodeFra, fodselsdato)
            : false;

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
                    tilDato: deductDays(new Date(periode.periodeFra), 1),
                    bostatus: Bostatuskode.IKKE_MED_FORELDER,
                });
            }

            if (!firstPeriod && !prevPeriodTilOrCurrentPeriodFraAreAdjacentDays) {
                perioder.push({
                    fraDato: addDays(perioder[perioder.length - 1].tilDato, 1),
                    tilDato: deductDays(new Date(periode.periodeFra), 1),
                    bostatus: Bostatuskode.IKKE_MED_FORELDER,
                });
            }

            perioder.push({
                fraDato: firstPeriod && !periode.periodeFra ? fodselsdato : dateOrNull(periode.periodeFra),
                tilDato: dateOrNull(periode.periodeTil),
                bostatus: Bostatuskode.MED_FORELDER,
            });

            if (lastPeriod && periode.periodeTil) {
                perioder.push({
                    fraDato: addDays(new Date(periode.periodeTil), 1),
                    tilDato: null,
                    bostatus: Bostatuskode.IKKE_MED_FORELDER,
                });
            }
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
): Sivilstandskode => {
    if (["GIFT", "SAMBOER", "REGISTRERT_PARTNER"].includes(sivilstand)) {
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
        sivilstandType: getSivilstandType(sivilstand.sivilstand),
    }));
};

export const getBarnPerioder = (
    perioder: HusstandOpplysningPeriode[] | SavedOpplysningFraFolkeRegistrePeriode[],
    virkningsOrSoktFraDato: Date,
    barnsFoedselsDato: string
) => {
    const perioderEtterVirkningstidspunkt = perioder?.filter(
        ({ tilDato }) => tilDato === null || (tilDato && isAfterDate(tilDato, virkningsOrSoktFraDato))
    );

    console.log("barnsFoedselsDato", barnsFoedselsDato);
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
            result.length === 0 ? virkningsOrSoktFraDato : addDays(new Date(result[result.length - 1].datoTom), 1)
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
        sivilstandType: Sivilstandskode;
        kilde: Kilde;
        datoFom: string;
        datoTom: string | null;
    }[] = [];
    perioderEtterVirkningstidspunkt?.forEach(({ datoTom, sivilstandType }) => {
        const prevPeriode = result[result.length - 1];
        const hasSameStatus = prevPeriode?.sivilstandType === sivilstandType;
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
                sivilstandType,
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
) => {
    return opplysningerFraFolkRegistre.map((barn) => ({
        ...barn,
        medISak: true,
        perioder: getBarnPerioder(barn.perioder, virkningsOrSoktFraDato, barn.foedselsDato),
    }));
};

export const createInitialValues = (
    boforhold: BoforholdResponse,
    opplysningerFraFolkRegistre: {
        husstand: HusstandOpplysningFraFolkeRegistre[];
        sivilstand: SivilstandOpplysninger[];
    },
    virkningsOrSoktFraDato: Date
) => {
    return {
        ...boforhold,
        husstandsBarn: boforhold?.husstandsBarn?.length
            ? boforhold.husstandsBarn
            : getBarnPerioderFromHusstandsListe(opplysningerFraFolkRegistre.husstand, virkningsOrSoktFraDato),
        sivilstand: boforhold?.sivilstand?.length
            ? boforhold.sivilstand
            : getSivilstandPerioder(opplysningerFraFolkRegistre.sivilstand, virkningsOrSoktFraDato),
    };
};

export const createPayload = (values: BoforholdFormValues) => ({
    husstandsBarn: values.husstandsBarn,
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
                (perioder[i].datoTom && isAfterDate(perioder[i].datoTom, perioder[j].datoFom))
            ) {
                overlappingPeriods.push([`${perioder[i].datoTom}`, `${perioder[j].datoFom}`]);
            }
        }
    }

    return overlappingPeriods;
};

function returnTypedPeriods(periodsList: HusstandsBarnPeriodeDto[]): HusstandsBarnPeriodeDto[];
function returnTypedPeriods(periodsList: SivilstandDto[]): SivilstandDto[];
function returnTypedPeriods(
    periodsList: HusstandsBarnPeriodeDto[] | SivilstandDto[]
): HusstandsBarnPeriodeDto[] | SivilstandDto[] {
    return periodsList;
}
export function editPeriods(periodsList: HusstandsBarnPeriodeDto[], periodeIndex: number): HusstandsBarnPeriodeDto[];
export function editPeriods(periodsList: SivilstandDto[], periodeIndex: number): SivilstandDto[];
export function editPeriods(
    periodsList: HusstandsBarnPeriodeDto[] | SivilstandDto[],
    periodeIndex: number
): HusstandsBarnPeriodeDto[] | SivilstandDto[] {
    const editedPeriod = { ...periodsList[periodeIndex], kilde: Kilde.MANUELL };
    const statusField = Object.hasOwn(periodsList[0], "bostatus") ? "bostatus" : "sivilstandType";

    const periods = periodsList.toSpliced(periodeIndex, 1);
    let startIndex = periods.filter(
        (period) => new Date(period.datoFom).getTime() < new Date(editedPeriod.datoFom).getTime()
    ).length;

    const postPeriodIndex = editedPeriod.datoTom
        ? periods.findIndex(
              (period) =>
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
                    ...returnTypedPeriods(periodsToEdit as HusstandsBarnPeriodeDto[])
                );
            }

            if (statusField === "sivilstandType") {
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
        return periods.toSpliced(startIndex, deleteCount, editedPeriod as HusstandsBarnPeriodeDto);
    }

    if (statusField === "sivilstandType") {
        return periods.toSpliced(startIndex, deleteCount, editedPeriod as SivilstandDto);
    }
}

export function removeAndEditPeriods(periodsList: HusstandsBarnPeriodeDto[], index: number): HusstandsBarnPeriodeDto[];
export function removeAndEditPeriods(periodsList: SivilstandDto[], index: number): SivilstandDto[];
export function removeAndEditPeriods(
    periodsList: HusstandsBarnPeriodeDto[] | SivilstandDto[],
    index: number
): HusstandsBarnPeriodeDto[] | SivilstandDto[] {
    const periodToRemove = periodsList[index];
    const prevPeriod = periodsList[index - 1];
    const postPeriod = periodsList[index + 1];

    prevPeriod.datoTom = postPeriod ? postPeriod.datoTom : periodToRemove.datoTom;
    prevPeriod.kilde = Kilde.MANUELL;

    if ("bostatus" in periodToRemove) {
        return periodsList.filter((_, i) => i !== index && i !== index + 1) as HusstandsBarnPeriodeDto[];
    }

    if ("sivilstandType" in periodToRemove) {
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
