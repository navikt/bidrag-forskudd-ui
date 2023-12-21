import { lastDayOfMonth } from "@navikt/bidrag-ui-common";

import { ForskuddAarsakType } from "../../../api/BidragBehandlingApi";
import {
    BehandlingDto as BehandlingDtoV1,
    ForskuddAarsakType as ForskuddAarsakTypeV1,
} from "../../../api/BidragBehandlingApiV1";
import { deductMonths, firstDayOfMonth, isAfterDate } from "../../../utils/date-utils";

export const getSoktFraOrMottatDato = (soktFraDato: Date, mottatDato: Date) => {
    return isAfterDate(soktFraDato, mottatDato) ? soktFraDato : mottatDato;
};
export const aarsakToVirkningstidspunktMapper = (
    aarsak: ForskuddAarsakTypeV1 | string,
    behandling: BehandlingDtoV1
) => {
    const soktFraDato = new Date(behandling.søktFomDato);
    const mottatDato = new Date(behandling.mottattdato);
    const mottatOrSoktFraDato = getSoktFraOrMottatDato(soktFraDato, mottatDato);
    const treMaanederTilbakeFraMottatDato = firstDayOfMonth(deductMonths(mottatDato, 3));
    const treMaanederTilbake = isAfterDate(soktFraDato, treMaanederTilbakeFraMottatDato)
        ? firstDayOfMonth(soktFraDato)
        : treMaanederTilbakeFraMottatDato;

    switch (aarsak) {
        // Fra kravfremsettelse
        case ForskuddAarsakType.DF:
            return firstDayOfMonth(mottatOrSoktFraDato);
        // 3 måneder tilbake
        case ForskuddAarsakType.EF:
            return isAfterDate(new Date(), soktFraDato) ? treMaanederTilbake : null;
        // Fra søknadstidspunkt
        case ForskuddAarsakType.HF:
            return firstDayOfMonth(soktFraDato);
        default:
            return null;
    }
};

export const getFomAndTomForMonthPicker = (virkningstidspunkt: Date | string) => {
    const virkningstidspunktIsInFuture = isAfterDate(
        firstDayOfMonth(new Date(virkningstidspunkt)),
        firstDayOfMonth(new Date())
    );
    const fom = firstDayOfMonth(new Date(virkningstidspunkt));
    const tom = virkningstidspunktIsInFuture
        ? lastDayOfMonth(new Date(virkningstidspunkt))
        : lastDayOfMonth(new Date());
    return [fom, tom];
};
