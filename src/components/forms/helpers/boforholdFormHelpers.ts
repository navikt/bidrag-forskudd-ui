import { UseFormSetValue } from "react-hook-form";

import { BehandlingDto, BoforholdResponse } from "../../../api/BidragBehandlingApi";
import { HentGrunnlagspakkeDto, RelatertPersonDto } from "../../../api/BidragGrunnlagApi";
import { BoStatusUI } from "../../../enum/BoStatus";
import {
    BarnPeriode,
    BoforholdFormValues,
    OpplysningFraFolkeRegistre,
    OpplysningFraFolkeRegistrePeriode,
    Sivilstand,
} from "../../../types/boforholdFormValues";
import {
    addDays,
    dateOrNull,
    deductDays,
    firstDayOfMonth,
    lastDayOfMonth,
    toISODateString,
} from "../../../utils/date-utils";

export const calculateFraDato = (fieldArrayValues: BarnPeriode[] | Sivilstand[], virkningstidspunkt: Date) => {
    if (fieldArrayValues.length && !fieldArrayValues.some((periode) => periode.datoTom === null)) {
        const filtrertOgSorterListe = fieldArrayValues.sort((a, b) => a.datoTom.getTime() - b.datoTom.getTime());
        return addDays(filtrertOgSorterListe[filtrertOgSorterListe.length - 1].datoTom, 1);
    }

    if (!fieldArrayValues.length) {
        return virkningstidspunkt;
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
                    boStatus: BoStatusUI.IKKE_REGISTRERT_PA_ADRESSE,
                });
            }
        } else if (addDays(perioder[i - 1].tilDato, 1).toDateString() !== new Date(periode.periodeFra).toDateString()) {
            perioder.push({
                fraDato: addDays(perioder[perioder.length - 1].tilDato, 1),
                tilDato: deductDays(new Date(periode.periodeFra), 1),
                boStatus: BoStatusUI.IKKE_REGISTRERT_PA_ADRESSE,
            });
        }

        perioder.push({
            fraDato: dateOrNull(periode.periodeFra),
            tilDato: dateOrNull(periode.periodeTil),
            boStatus: BoStatusUI.REGISTRERT_PA_ADRESSE,
        });

        if (
            i === egneBarnIHusstanden.borISammeHusstandDtoListe.length - 1 &&
            periode.periodeTil &&
            periode.periodeTil !== egneBarnIHusstanden.brukTil
        ) {
            perioder.push({
                fraDato: addDays(new Date(periode.periodeTil), 1),
                tilDato: dateOrNull(egneBarnIHusstanden.brukTil),
                boStatus: BoStatusUI.IKKE_REGISTRERT_PA_ADRESSE,
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

const barnPerioder = (perioder: OpplysningFraFolkeRegistrePeriode[], datoFom: Date) => {
    const perioderFraVirkningstidspunkt = perioder?.filter(
        (periode) => periode.tilDato === null || new Date(periode.tilDato) > new Date(datoFom)
    );

    const result: { boStatus: BoStatusUI; kilde: "offentlig" | "manuelt"; datoFom: Date; datoTom: Date | null }[] = [];
    perioderFraVirkningstidspunkt?.forEach((periode, i) => {
        result.push({
            boStatus: periode.boStatus,
            kilde: "offentlig",
            datoFom:
                i === 0
                    ? datoFom
                        ? new Date(datoFom)
                        : firstDayOfMonth(periode.fraDato)
                    : addDays(result[i - 1].datoTom, 1),
            datoTom: periode.tilDato ? lastDayOfMonth(periode.tilDato) : periode.tilDato,
        });
    });

    return result;
};
const getBarnPerioderFromHusstandsListe = (
    opplysningerFraFolkRegistre: OpplysningFraFolkeRegistre[],
    datoFom: Date
) => {
    return opplysningerFraFolkRegistre.map((barn) => ({
        ...barn,
        medISaken: true,
        perioder: barnPerioder(barn.perioder, datoFom),
    }));
};

const getSivilstandPerioder = (sivilstandListe, datoFom) => {
    return sivilstandListe
        .filter((periode) => periode.periodeTil === null || new Date(periode.periodeTil) > new Date(datoFom))
        .map((periode) => ({
            sivilstandType: periode.sivilstand,
            gyldigFraOgMed:
                new Date(periode.periodeFra) < new Date(datoFom) ? dateOrNull(datoFom) : dateOrNull(periode.periodeFra),
            datoTom: dateOrNull(periode.periodeTil),
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
        ? boforhold.husstandsBarn.map((barn) => ({
              ...barn,
              perioder: barn.perioder.map((periode) => ({
                  ...periode,
                  datoFom: dateOrNull(periode.datoFom),
                  datoTom: dateOrNull(periode.datoTom),
              })),
          }))
        : getBarnPerioderFromHusstandsListe(opplysningerFraFolkRegistre, datoFom),
    sivilstand: boforhold?.sivilstand?.length
        ? boforhold.sivilstand.map((stand) => ({
              ...stand,
              gyldigFraOgMed: dateOrNull(stand.gyldigFraOgMed),
              datoTom: dateOrNull(stand.datoTom),
          }))
        : getSivilstandPerioder(grunnlagspakke.sivilstandListe, datoFom),
});

export const createPayload = (values: BoforholdFormValues) => ({
    husstandsBarn: values.husstandsBarn.map((barn) => ({
        ...barn,
        perioder: barn.perioder.map((periode) => ({
            ...periode,
            boStatus: periode.boStatus === "" ? null : periode.boStatus,
            datoFom: toISODateString(periode.datoFom),
            datoTom: toISODateString(periode.datoTom),
        })),
    })),
    sivilstand: values.sivilstand.map((periode) => ({
        ...periode,
        gyldigFraOgMed: toISODateString(periode.gyldigFraOgMed),
        datoTom: toISODateString(periode.datoTom),
    })),
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
    date: Date | null,
    barnIndex: number,
    periodeIndex: number,
    field: "datoFom" | "datoTom",
    setValue: UseFormSetValue<BoforholdFormValues>
) => {
    if (field === "datoFom" && periods[periodeIndex - 1] && date) {
        setValue(`husstandsBarn.${barnIndex}.perioder.${periodeIndex - 1}.datoTom`, deductDays(date, 1));
    }
    if (field === "datoTom" && periods[periodeIndex + 1] && date) {
        setValue(`husstandsBarn.${barnIndex}.perioder.${periodeIndex + 1}.datoFom`, addDays(date, 1));
    }
    setValue(`husstandsBarn.${barnIndex}.perioder.${periodeIndex}.${field}`, date);
};
