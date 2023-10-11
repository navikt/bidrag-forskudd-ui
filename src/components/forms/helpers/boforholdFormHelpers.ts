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

export const fillInPeriodGaps = (egneBarnIHusstanden: RelatertPersonDto) => {
    const perioder: OpplysningFraFolkeRegistrePeriode[] = [];
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

export const getBarnPerioder = (perioder: OpplysningFraFolkeRegistrePeriode[], virkningsOrSoktFraDato: Date) => {
    const perioderEtterVirkningstidspunkt = perioder?.filter(
        (periode) => periode.tilDato === null || (periode.tilDato && periode.tilDato > virkningsOrSoktFraDato)
    );

    const result: {
        boStatus: BoStatusType;
        kilde: "offentlig";
        datoFom: string;
        datoTom: string | null;
    }[] = [];
    perioderEtterVirkningstidspunkt?.forEach((periode, i) => {
        result.push({
            boStatus: periode.boStatus,
            kilde: "offentlig",
            datoFom: toISODateString(i === 0 ? virkningsOrSoktFraDato : addDays(new Date(result[i - 1].datoTom), 1)),
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

export const compareOpplysninger = (
    savedOpplysninger: {
        husstand: { ident: string; navn: string; perioder: { fraDato: string; tilDato: string; boStatus: string }[] }[];
        sivilstand: { personId: string; periodeFra: string; periodeTil: string; sivilstand: string }[];
    },
    latestOpplysninger: { husstand: OpplysningFraFolkeRegistre[]; sivilstand: SivilstandDtoGrunnlag[] }
) => {
    const changedLog = [];

    if (savedOpplysninger.husstand.length < latestOpplysninger.husstand.length) {
        changedLog.push("Det er flere barn registret i folkeregistre.");
    }
    if (savedOpplysninger.husstand.length > latestOpplysninger.husstand.length) {
        changedLog.push("Det er fære barn registret i folkeregistre.");
    }

    const removed = savedOpplysninger.husstand?.filter(
        (b) => !latestOpplysninger.husstand?.some((barn) => barn.ident === b.ident)
    );

    const added = latestOpplysninger.husstand?.filter(
        (b) => !savedOpplysninger.husstand.some((barn) => barn.ident === b.ident)
    );

    if (added.length) {
        changedLog.push("Barn som har blitt lagt inn i nye opplysninger fra folkeregisteret:");
        added.forEach((barn) => changedLog.push(`${barn.navn} / ${barn.ident}`));
    }

    if (removed.length) {
        changedLog.push("Barn som ikke finnes i nye opplysninger fra folkeregisteret:");
        removed.forEach((barn) => changedLog.push(`${barn.navn} / ${barn.ident}`));
    }

    savedOpplysninger.husstand.forEach((barn) => {
        const barnInLatestOpplysninger = latestOpplysninger.husstand.find((b) => barn.ident === b.ident);
        if (barnInLatestOpplysninger && barnInLatestOpplysninger.perioder.length > barn.perioder.length) {
            changedLog.push(`En eller flere perioder har blitt lagt til barn med ident - ${barn.ident}`);
        }
        if (barnInLatestOpplysninger && barnInLatestOpplysninger.perioder.length < barn.perioder.length) {
            changedLog.push(`Det er minst en periode mindre i folkeregistre for barn med ident - ${barn.ident}`);
        }
        barn.perioder.forEach((periode, index) => {
            const periodeFraLatestOpplysninger = barnInLatestOpplysninger?.perioder[index];
            if (periodeFraLatestOpplysninger) {
                if (
                    toISODateString(dateOrNull(periode.fraDato)) !==
                        toISODateString(periodeFraLatestOpplysninger.fraDato) ||
                    toISODateString(dateOrNull(periode.tilDato)) !==
                        toISODateString(periodeFraLatestOpplysninger.tilDato)
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
            if (periodeFraLatestOpplysninger && periodeFraLatestOpplysninger.personId === periode.personId) {
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
