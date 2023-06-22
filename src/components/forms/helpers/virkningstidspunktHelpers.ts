import { BehandlingDto, ForskuddAarsakType } from "../../../api/BidragBehandlingApi";
import { deductMonths, firstDayOfMonth } from "../../../utils/date-utils";

export const aarsakToVirkningstidspunktMapper = (aarsak: ForskuddAarsakType | string, behandling: BehandlingDto) => {
    switch (aarsak) {
        case ForskuddAarsakType.DF:
            return firstDayOfMonth(new Date(behandling.mottatDato));
        case ForskuddAarsakType.HF:
            return firstDayOfMonth(new Date(behandling.datoFom));
        case ForskuddAarsakType.EF:
            return new Date() > new Date(behandling.datoFom)
                ? firstDayOfMonth(deductMonths(new Date(behandling.mottatDato), 3))
                : null;
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
