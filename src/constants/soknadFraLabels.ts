import { SoknadFraType } from "../api/BidragBehandlingApi";

export const SOKNAD_LABELS = {
    [SoknadFraType.BIDRAGSMOTTAKER]: "BM",
    [SoknadFraType.BM_I_ANNEN_SAK]: "BM i annen sak",
    [SoknadFraType.FYLKESNEMDA]: "Fylkesnemda",
    [SoknadFraType.NAV_BIDRAG]: "NAV bidrag",
    [SoknadFraType.BARN18AAR]: "BARN18",
    [SoknadFraType.KONVERTERING]: "Konvertering",
    [SoknadFraType.NAV_INTERNASJONAL]: "NAV internasjonal",
    [SoknadFraType.NORSKE_MYNDIGHET]: "Norske myndigheter",
    [SoknadFraType.BIDRAGSPLIKTIG]: "BP",
    [SoknadFraType.TRYGDEETATEN_INNKREVING]: "Trygdeetaten innkreving",
    [SoknadFraType.UTENLANDSKE_MYNDIGHET]: "Utenlandske myndigheter",
    [SoknadFraType.VERGE]: "Verge",
    [SoknadFraType.KOMMUNE]: "Kommune",
    [SoknadFraType.KLAGE_ANKE]: "Klage anke",
} as const;
