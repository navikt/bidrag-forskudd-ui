import { lastDayOfMonth } from "@navikt/bidrag-ui-common";

import { BehandlingDtoV2, TypeArsakstype } from "../../../api/BidragBehandlingApiV1";
import { dateOrNull, deductMonths, firstDayOfMonth, isAfterDate, minOfDates } from "../../../utils/date-utils";

export const getSoktFraOrMottatDato = (soktFraDato: Date, mottatDato: Date) => {
    return isAfterDate(soktFraDato, mottatDato) ? soktFraDato : mottatDato;
};
export const aarsakToVirkningstidspunktMapper = (
    aarsak: TypeArsakstype | string,
    behandling: BehandlingDtoV2,
    barnsFødselsdato?: string
) => {
    const nyVirkningstidspunkt = mapÅrsakTilVirkningstidspunkt(aarsak, behandling, barnsFødselsdato);
    const opprinneligVirkningstidspunkt = dateOrNull(behandling.virkningstidspunkt.opprinneligVirkningstidspunkt);

    if (opprinneligVirkningstidspunkt != null && nyVirkningstidspunkt != null) {
        return minOfDates(opprinneligVirkningstidspunkt, nyVirkningstidspunkt);
    }
    return nyVirkningstidspunkt;
};
export const mapÅrsakTilVirkningstidspunkt = (
    aarsak: TypeArsakstype | string,
    behandling: BehandlingDtoV2,
    barnsFødselsdato?: string
) => {
    const soktFraDato = new Date(behandling.søktFomDato);
    const mottatDato = new Date(behandling.mottattdato);
    const mottatOrSoktFraDato = getSoktFraOrMottatDato(soktFraDato, mottatDato);
    const treMaanederTilbakeFraMottatDato = firstDayOfMonth(deductMonths(mottatDato, 3));
    const treMaanederTilbake = isAfterDate(soktFraDato, treMaanederTilbakeFraMottatDato)
        ? firstDayOfMonth(soktFraDato)
        : treMaanederTilbakeFraMottatDato;

    switch (aarsak) {
        case TypeArsakstype.FRABARNETSFODSEL:
            return barnsFødselsdato && isAfterDate(new Date(barnsFødselsdato), mottatOrSoktFraDato)
                ? firstDayOfMonth(new Date(barnsFødselsdato))
                : firstDayOfMonth(mottatOrSoktFraDato);
        // Fra kravfremsettelse
        case TypeArsakstype.FRA_KRAVFREMSETTELSE:
            return firstDayOfMonth(mottatOrSoktFraDato);
        // 3 måneder tilbake
        case TypeArsakstype.TREMANEDERTILBAKE:
            return isAfterDate(new Date(), soktFraDato) ? treMaanederTilbake : null;
        // Fra søknadstidspunkt
        case TypeArsakstype.FRASOKNADSTIDSPUNKT:
            return firstDayOfMonth(soktFraDato);
        default:
            return soktFraDato;
    }
};
export const getFomAndTomForMonthPicker = (virkningstidspunkt: Date | string) => {
    const fom = firstDayOfMonth(new Date(virkningstidspunkt));
    const tom = lastDayOfMonth(deductMonths(new Date(), 1));

    return [fom, tom];
};
