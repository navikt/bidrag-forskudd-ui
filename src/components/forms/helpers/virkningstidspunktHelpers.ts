import { BehandlingDto } from "../../../api/BidragBehandlingApi";
import { DDMMYYYYStringToDate, deductMonths, firstDayOfMonth } from "../../../utils/date-utils";

// TODO: AF should map to "fra barnets fødsel"
const aarsakToDateMap = (behandling: BehandlingDto) => ({
    NF: firstDayOfMonth(deductMonths(DDMMYYYYStringToDate(behandling.mottatDato), 3)),
    CF: firstDayOfMonth(DDMMYYYYStringToDate(behandling.datoFom)),
    DF: firstDayOfMonth(DDMMYYYYStringToDate(behandling.mottatDato)),
    HF: firstDayOfMonth(DDMMYYYYStringToDate(behandling.datoFom)),
    BF: firstDayOfMonth(DDMMYYYYStringToDate(behandling.datoFom)),
    EF: firstDayOfMonth(deductMonths(DDMMYYYYStringToDate(behandling.mottatDato), 3)),
});

export const aarsakToVirkningstidspunktMapper = (aarsak: string, behandling: BehandlingDto) => {
    const aarsakToDate = aarsakToDateMap(behandling);
    if (Object.hasOwn(aarsakToDate, aarsak)) {
        return aarsakToDate[aarsak];
    }
    return null;
};
