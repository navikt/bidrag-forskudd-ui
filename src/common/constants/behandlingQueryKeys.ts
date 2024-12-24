import { UnderholdDto, UnderholdskostnadValideringsfeil } from "../../api/BidragBehandlingApiV1";

export default {
    tab: "tab",
    steg: "steg",
    lesemodus: "lesemodus",
};

export const toUnderholdskostnadTabQueryParameterForUnderhold = (
    underhold?: UnderholdDto | UnderholdskostnadValideringsfeil
) => {
    return toUnderholdskostnadTabQueryParameter(underhold?.gjelderBarn?.id, underhold?.gjelderBarn?.medIBehandlingen);
};

export const toUnderholdskostnadTabQueryParameter = (gjelderBarnId?: number, medIBehandlingen = false) => {
    if (medIBehandlingen) {
        return `underholdskostnaderMedIBehandling-${gjelderBarnId}`;
    }
    return "underholdskostnaderAndreBarn";
};
