import { RolleType } from "../../../api/BidragBehandlingApi";
import { addDays, dateOrNull, deductDays, lastDayOfMonth } from "../../../utils/date-utils";

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

export const mapHusstandsMedlemmerToBarn = (behandling, husstandListe) => {
    const barnFraBehandling = behandling.data?.roller?.filter((rolle) => rolle.rolleType === RolleType.BARN);
    return barnFraBehandling.map((barn) => ({
        ident: barn.ident,
        navn: "",
        perioder: husstandListe
            ?.map((h) => {
                const fraDato = h.gyldigFraOgMed;
                const tilDato = h.gyldigTilOgMed;

                const barnPerioderHosBM = h.husstandsmedlemListe.filter((medlem) => medlem.personId === barn.ident);
                const perioder = [];
                barnPerioderHosBM.forEach((periode, i) => {
                    if (i === 0) {
                        if (
                            new Date(periode.foedselsdato) < new Date(periode.gyldigFraOgMed) &&
                            new Date(fraDato) < new Date(periode.gyldigFraOgMed)
                        ) {
                            perioder.push({
                                fraDato:
                                    new Date(fraDato) < new Date(periode.foedselsdato)
                                        ? dateOrNull(periode.foedselsdato)
                                        : dateOrNull(fraDato),
                                tilDato: deductDays(periode.gyldigFraOgMed, 1),
                                boStatus: "ikke_registrert_paa_adresse",
                            });
                        }
                    } else if (
                        addDays(perioder[i - 1].tilDato, 1).toDateString() !==
                        new Date(periode.gyldigFraOgMed).toDateString()
                    ) {
                        perioder.push({
                            fraDato: addDays(perioder[perioder.length - 1].tilDato, 1),
                            tilDato: deductDays(periode.gyldigFraOgMed, 1),
                            boStatus: "ikke_registrert_paa_adresse",
                        });
                    }

                    perioder.push({
                        fraDato: dateOrNull(periode.gyldigFraOgMed),
                        tilDato: dateOrNull(periode.gyldigTilOgMed),
                        boStatus: "registrert_paa_adresse",
                    });

                    if (
                        i === barnPerioderHosBM.length - 1 &&
                        periode.gyldigTilOgMed &&
                        periode.gyldigTilOgMed !== tilDato
                    ) {
                        perioder.push({
                            fraDato: addDays(periode.gyldigTilOgMed, 1),
                            tilDato: dateOrNull(tilDato),
                            boStatus: "ikke_registrert_paa_adresse",
                        });
                    }
                });
                return perioder;
            })
            .flat(),
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
    const perioderFraVirkningstidspunkt = perioder?.filter(
        (periode) => periode.tilDato === null || new Date(periode.tilDato) > new Date(virkningstidspunkt)
    );
    const result = [];
    perioderFraVirkningstidspunkt?.forEach((periode, i) => {
        result.push({
            ...periode,
            kilde: "offentlig",
            fraDato: i === 0 ? new Date(virkningstidspunkt) : addDays(result[i - 1].tilDato, 1),
            tilDato: periode.tilDato ? lastDayOfMonth(periode.tilDato) : periode.tilDato,
        });
    });

    return result;
};

export const createInitialValues = (
    behandling,
    boforhold,
    opplysninger,
    boforoholdOpplysninger,
    virkningstidspunkt
) => ({
    ...boforhold,
    barn: boforoholdOpplysninger
        ? boforhold.barn.map((barn) => ({
              ...barn,
              perioder: barn.perioder.map((periode) => ({
                  ...periode,
                  edit: false,
                  fraDato: dateOrNull(periode.fraDato),
                  tilDato: dateOrNull(periode.tilDato),
              })),
          }))
        : getBarnPerioderFromHusstandsListe(opplysninger, virkningstidspunkt),
    sivilstand: boforhold.sivilstand.length
        ? boforhold.sivilstand.map((stand) => ({
              ...stand,
              fraDato: dateOrNull(stand.fraDato),
              tilDato: dateOrNull(stand.tilDato),
          }))
        : [],
});
