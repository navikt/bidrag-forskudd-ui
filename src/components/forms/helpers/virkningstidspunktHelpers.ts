import { BehandlingDto } from "../../../api/BidragBehandlingApi";
import { deductMonths, firstDayOfMonth } from "../../../utils/date-utils";

// TODO: AF should map to "fra barnets fødsel"
const aarsakToDateMap = (behandling: BehandlingDto) => ({
    NF: firstDayOfMonth(deductMonths(new Date(behandling.mottatDato), 3)),
    CF: firstDayOfMonth(new Date(behandling.datoFom)),
    DF: firstDayOfMonth(new Date(behandling.mottatDato)),
    HF: firstDayOfMonth(new Date(behandling.datoFom)),
    BF: firstDayOfMonth(new Date(behandling.datoFom)),
    EF: firstDayOfMonth(deductMonths(new Date(behandling.mottatDato), 3)),
});

export const aarsakToVirkningstidspunktMapper = (aarsak: string, behandling: BehandlingDto) => {
    const aarsakToDate = aarsakToDateMap(behandling);
    if (Object.hasOwn(aarsakToDate, aarsak)) {
        return aarsakToDate[aarsak];
    }
    return null;
};
