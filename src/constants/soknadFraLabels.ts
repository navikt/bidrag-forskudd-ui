import { SoktAvType } from "../api/BidragBehandlingApi";

export const SOKNAD_LABELS = {
    [SoktAvType.BIDRAGSMOTTAKER]: "BM",
    [SoktAvType.BM_I_ANNEN_SAK]: "BM i annen sak",
    [SoktAvType.FYLKESNEMDA]: "Fylkesnemda",
    [SoktAvType.NAV_BIDRAG]: "NAV bidrag",
    [SoktAvType.BARN18AAR]: "BARN18",
    [SoktAvType.KONVERTERING]: "Konvertering",
    [SoktAvType.NAV_INTERNASJONALT]: "NAV internasjonal",
    [SoktAvType.NORSKE_MYNDIGHET]: "Norske myndigheter",
    [SoktAvType.BIDRAGSPLIKTIG]: "BP",
    [SoktAvType.TRYGDEETATEN_INNKREVING]: "Trygdeetaten innkreving",
    [SoktAvType.UTENLANDSKE_MYNDIGHET]: "Utenlandske myndigheter",
    [SoktAvType.VERGE]: "Verge",
    [SoktAvType.KOMMUNE]: "Kommune",
    [SoktAvType.KLAGE_ANKE]: "Klage anke",
} as const;
