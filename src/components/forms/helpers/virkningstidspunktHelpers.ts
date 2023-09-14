import { BehandlingDto, ForskuddAarsakType } from "../../../api/BidragBehandlingApi";
import { deductMonths, firstDayOfMonth } from "../../../utils/date-utils";

export const aarsakToVirkningstidspunktMapper = (aarsak: ForskuddAarsakType | string, behandling: BehandlingDto) => {
    const datoFom = new Date(behandling.datoFom);
    const mottatDato = new Date(behandling.mottatDato);
    const mottatOrSoktFraDato = datoFom.getTime() > mottatDato.getTime() ? datoFom : mottatDato;

    switch (aarsak) {
        // Fra samlivsbrudd
        case ForskuddAarsakType.BF:
            return firstDayOfMonth(datoFom);
        // Fra barnets flyttemåned
        case ForskuddAarsakType.CF:
            return firstDayOfMonth(datoFom);
        // Fra kravfremsettelse
        case ForskuddAarsakType.DF:
            return firstDayOfMonth(mottatOrSoktFraDato);
        // 3 måneder tilbake
        case ForskuddAarsakType.EF:
            return new Date().getTime() > datoFom.getTime()
                ? firstDayOfMonth(deductMonths(mottatOrSoktFraDato, 3))
                : null;
        // Fra søknadstidspunkt
        case ForskuddAarsakType.HF:
            return firstDayOfMonth(datoFom);
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
