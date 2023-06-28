import { BoStatusType } from "../../../api/BidragBehandlingApi";
import { RelatertPersonDto } from "../../../api/BidragGrunnlagApi";
import {
    addDays,
    dateOrNull,
    deductDays,
    firstDayOfMonth,
    lastDayOfMonth,
    toISODateString,
} from "../../../utils/date-utils";

export const calculateFraDato = (fieldArrayValues, virkningstidspunkt) => {
    if (fieldArrayValues.length && !fieldArrayValues.some((periode) => periode.tilDato === null)) {
        const filtrertOgSorterListe = fieldArrayValues.sort((a, b) => a.tilDato.getTime() - b.tilDato.getTime());
        return addDays(filtrertOgSorterListe[filtrertOgSorterListe.length - 1].tilDato, 1);
    }

    if (!fieldArrayValues.length) {
        return virkningstidspunkt;
    }
    return null;
};

const fillInPeriodGaps = (egneBarnIHusstanden: RelatertPersonDto) => {
    const perioder = [];
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
            boStatus: BoStatusType.DOKUMENTERT_BOENDE_HOS_BM,
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

export const mapHusstandsMedlemmerToBarn = (husstandmedlemmerOgEgneBarnListe) => {
    return husstandmedlemmerOgEgneBarnListe
        .filter((medlem) => medlem.erBarnAvBmBp)
        .map((barn) => ({
            ident: barn.relatertPersonPersonId,
            navn: barn.navn,
            perioder: fillInPeriodGaps(barn),
        }));
};

const getBarnPerioderFromHusstandsListe = (result, datoFom) => {
    return result.map((barn) => ({
        ...barn,
        medISaken: true,
        perioder: barnPerioder(barn.perioder, datoFom),
    }));
};

const barnPerioder = (perioder, datoFom) => {
    const perioderFraVirkningstidspunkt = perioder?.filter(
        (periode) => periode.tilDato === null || new Date(periode.tilDato) > new Date(datoFom)
    );

    const result = [];
    perioderFraVirkningstidspunkt?.forEach((periode, i) => {
        result.push({
            ...periode,
            kilde: "offentlig",
            fraDato:
                i === 0
                    ? datoFom
                        ? new Date(datoFom)
                        : firstDayOfMonth(periode.fraDato)
                    : addDays(result[i - 1].tilDato, 1),
            tilDato: periode.tilDato ? lastDayOfMonth(periode.tilDato) : periode.tilDato,
        });
    });

    return result;
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
    behandling,
    boforhold,
    opplysninger,
    boforoholdOpplysninger,
    datoFom,
    grunnlagspakke
) => ({
    ...boforhold,
    husstandsBarn: boforoholdOpplysninger
        ? boforhold.husstandsBarn.map((barn) => ({
              ...barn,
              perioder: barn.perioder.map((periode) => ({
                  ...periode,
                  edit: false,
                  fraDato: dateOrNull(periode.fraDato),
                  tilDato: dateOrNull(periode.tilDato),
              })),
          }))
        : getBarnPerioderFromHusstandsListe(opplysninger, datoFom),
    sivilstand: boforhold?.sivilstand?.length
        ? boforhold.sivilstand.map((stand) => ({
              ...stand,
              gyldigFraOgMed: dateOrNull(stand.gyldigFraOgMed),
              datoTom: dateOrNull(stand.datoTom),
          }))
        : getSivilstandPerioder(grunnlagspakke.sivilstandListe, datoFom),
});

export const createPayload = (values) => ({
    husstandsBarn: values.husstandsBarn.map((barn) => ({
        ...barn,
        perioder: barn.perioder.map((periode) => ({
            ...periode,
            boStatus: periode.boStatus === "" ? null : periode.boStatus,
            fraDato: toISODateString(periode.fraDato),
            tilDato: toISODateString(periode.tilDato),
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
