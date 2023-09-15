import { BehandlingDto, ForskuddAarsakType } from "../../../api/BidragBehandlingApi";
import { deductMonths, firstDayOfMonth } from "../../../utils/date-utils";

export const aarsakToVirkningstidspunktMapper = (aarsak: ForskuddAarsakType | string, behandling: BehandlingDto) => {
    const soktFraDato = new Date(behandling.datoFom);
    const mottatDato = new Date(behandling.mottatDato);
    const mottatOrSoktFraDato = soktFraDato.getTime() > mottatDato.getTime() ? soktFraDato : mottatDato;
    const treMaanederTilbakeFraMottatDato = firstDayOfMonth(deductMonths(mottatDato, 3));
    const treMaanederTilbake =
        soktFraDato.getTime() > treMaanederTilbakeFraMottatDato.getTime()
            ? firstDayOfMonth(soktFraDato)
            : treMaanederTilbakeFraMottatDato;

    switch (aarsak) {
        // Fra kravfremsettelse
        case ForskuddAarsakType.DF:
            return firstDayOfMonth(mottatOrSoktFraDato);
        // 3 måneder tilbake
        case ForskuddAarsakType.EF:
            return new Date().getTime() > soktFraDato.getTime() ? treMaanederTilbake : null;
        // Fra søknadstidspunkt
        case ForskuddAarsakType.HF:
            return firstDayOfMonth(soktFraDato);
        default:
            return null;
    }
};

export const getFomAndTomForMonthPicker = (soktFraDato) => {
    const soktFraIsInFuture = firstDayOfMonth(new Date(soktFraDato)) > firstDayOfMonth(new Date());
    const fom = soktFraIsInFuture ? firstDayOfMonth(new Date()) : firstDayOfMonth(new Date(soktFraDato));
    const tom = soktFraIsInFuture ? firstDayOfMonth(new Date(soktFraDato)) : firstDayOfMonth(new Date());
    return [fom, tom];
};
