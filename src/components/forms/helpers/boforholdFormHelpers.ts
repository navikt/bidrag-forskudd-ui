import {
    HusstandsBarnDto,
    HusstandsBarnPeriodeDto,
    RolleType,
    UpdateBoforholdRequest,
} from "../../../api/BidragBehandlingApi";
import {BarnPeriode} from "../../../types/boforholdFormValues"
import { RelatertPersonDto } from "../../../api/BidragGrunnlagApi";
import {
    addDays,
    dateOrNull,
    deductDays,
    firstDayOfMonth,
    lastDayOfMonth,
    toDateString,
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

const fillInPeriodGaps = (egneBarnIHusstanden: RelatertPersonDto): BarnPeriode[] => {
    const perioder: BarnPeriode[] = [];
    const brukFra = new Date(egneBarnIHusstanden.brukFra);
    const fodselsdato = new Date(egneBarnIHusstanden.fodselsdato);
    egneBarnIHusstanden.borISammeHusstandDtoListe.forEach((periode, i) => {
        if (i === 0) {
            if (fodselsdato < new Date(periode.periodeFra) && brukFra < new Date(periode.periodeFra)) {
                perioder.push({
                    datoFom: brukFra < fodselsdato ? fodselsdato : brukFra,
                    datoTom: deductDays(brukFra, 1),
                    boStatus: "ikke_registrert_paa_adresse",
                });
            }
        } else if (addDays(perioder[i - 1].datoTom, 1).toDateString() !== new Date(periode.periodeFra).toDateString()) {
            perioder.push({
                datoFom: addDays(perioder[perioder.length - 1].datoTom, 1),
                datoTom: deductDays(new Date(periode.periodeFra), 1),
                boStatus: "ikke_registrert_paa_adresse",
            });
        }

        perioder.push({
            datoFom: dateOrNull(periode.periodeFra),
            datoTom: dateOrNull(periode.periodeTil),
            boStatus: "registrert_paa_adresse",
        });

        if (
            i === egneBarnIHusstanden.borISammeHusstandDtoListe.length - 1 &&
            periode.periodeTil &&
            periode.periodeTil !== egneBarnIHusstanden.brukTil
        ) {
            perioder.push({
                datoFom: addDays(new Date(periode.periodeTil), 1),
                datoTom: dateOrNull(egneBarnIHusstanden.brukTil),
                boStatus: "ikke_registrert_paa_adresse",
            });
        }
    });
    return perioder;
};

export const mapHusstandsMedlemmerToBarn = (behandling, husstandmedlemmerOgEgneBarnListe) => {
    const barnFraBehandling = behandling?.roller?.filter((rolle) => rolle.rolleType === RolleType.BARN);
    return husstandmedlemmerOgEgneBarnListe
        .filter((medlem) => barnFraBehandling.find((barn) => barn.ident === medlem.relatertPersonPersonId))
        .map((barn) => ({
            ident: barn.relatertPersonPersonId,
            navn: barn.navn,
            perioder: fillInPeriodGaps(barn),
        }));
};

const getBarnPerioderFromHusstandsListe = (result, virkningstidspunkt) => {
    return result.map((barn) => ({
        ...barn,
        medISaken: true,
        perioder: barnPerioder(barn.perioder, virkningstidspunkt),
    }));
};

const barnPerioder = (perioder, virkningstidspunkt) => {
    const perioderFraVirkningstidspunkt = virkningstidspunkt
        ? perioder?.filter(
              (periode) => periode.tilDato === null || new Date(periode.tilDato) > new Date(virkningstidspunkt)
          )
        : perioder;

    const result = [];
    perioderFraVirkningstidspunkt?.forEach((periode, i) => {
        result.push({
            ...periode,
            kilde: "offentlig",
            fraDato:
                i === 0
                    ? virkningstidspunkt
                        ? new Date(virkningstidspunkt)
                        : firstDayOfMonth(periode.fraDato)
                    : addDays(result[i - 1].tilDato, 1),
            tilDato: periode.tilDato ? lastDayOfMonth(periode.tilDato) : periode.tilDato,
        });
    });

    return result;
};

const getSivilstandPerioder = (sivilstandListe) => {
    return sivilstandListe.map((periode) => ({
        sivilstandType: periode.sivilstand,
        fraDato: dateOrNull(periode.periodeFra),
        tilDato: dateOrNull(periode.periodeTil),
    }));
};

export const createInitialValues = (
    behandling,
    boforhold,
    opplysninger,
    boforoholdOpplysninger,
    virkningstidspunkt,
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
        : getBarnPerioderFromHusstandsListe(opplysninger, virkningstidspunkt),
    sivilstand: boforhold?.sivilstand?.length
        ? boforhold.sivilstand.map((stand) => ({
              ...stand,
              fraDato: dateOrNull(stand.fraDato),
              tilDato: dateOrNull(stand.tilDato),
          }))
        : getSivilstandPerioder(grunnlagspakke.sivilstandListe),
    boforholdBegrunnelseMedIVedtakNotat: behandling.boforholdBegrunnelseMedIVedtakNotat,
    boforholdBegrunnelseKunINotat: behandling.boforholdBegrunnelseKunINotat,
});

export const createPayload = (values): UpdateBoforholdRequest => ({
    husstandsBarn: values.husstandsBarn.map(
        (barn): HusstandsBarnDto => ({
            ...barn,
            perioder: barn.perioder.map(
                (periode): HusstandsBarnPeriodeDto => ({
                    ...periode,
                    datoFom: periode.fraDato ? toDateString(periode.fraDato) : "",
                    datoTom: periode.tilDato ? toDateString(periode.tilDato) : "",
                })
            ),
        })
    ),
    sivilstand: values.sivilstand.map((periode) => ({
        ...periode,
        fraDato: periode.fraDato ? toDateString(periode.fraDato) : "",
        tilDato: periode.tilDato ? toDateString(periode.tilDato) : "",
    })),
    boforholdBegrunnelseMedIVedtakNotat: values.boforholdBegrunnelseMedIVedtakNotat,
    boforholdBegrunnelseKunINotat: values.boforholdBegrunnelseKunINotat,
});
