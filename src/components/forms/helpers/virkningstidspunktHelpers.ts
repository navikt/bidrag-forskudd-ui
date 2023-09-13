import { BehandlingDto, ForskuddAarsakType } from "../../../api/BidragBehandlingApi";
import { deductMonths, firstDayOfMonth } from "../../../utils/date-utils";

export const aarsakToVirkningstidspunktMapper = (aarsak: ForskuddAarsakType | string, behandling: BehandlingDto) => {
    switch (aarsak) {
        // Fra samlivsbrudd
        case ForskuddAarsakType.BF:
            return firstDayOfMonth(new Date(behandling.datoFom));
        // Fra barnets flyttemåned
        case ForskuddAarsakType.CF:
            return firstDayOfMonth(new Date(behandling.datoFom));
        // Fra kravfremsettelse
        case ForskuddAarsakType.DF:
            return firstDayOfMonth(new Date(behandling.mottatDato));
        // 3 måneder tilbake
        case ForskuddAarsakType.EF:
            return new Date() > new Date(behandling.datoFom)
                ? firstDayOfMonth(deductMonths(new Date(behandling.mottatDato), 3))
                : null;
        // Fra søknadstidspunkt
        case ForskuddAarsakType.HF:
            return firstDayOfMonth(new Date(behandling.datoFom));
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
