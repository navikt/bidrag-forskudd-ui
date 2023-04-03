import { SoknadFraType } from "../api/BidragBehandlingApi";

export const SOKNAD_LABELS = {
    [SoknadFraType.BM_I_ANNEN_SAK]: "BM i annen sak",
    [SoknadFraType.TK]: "TK",
    [SoknadFraType.FTK]: "FTK",
    [SoknadFraType.BARN18]: "BARN18",
    [SoknadFraType.FYLKESNEMDA]: "Fylkesnemda",
    [SoknadFraType.KONVERTERING]: "Konvertering",
    [SoknadFraType.BM]: "BM",
    [SoknadFraType.NORSKE_MYNDIGH]: "Norske myndigheter",
    [SoknadFraType.BP]: "BP",
    [SoknadFraType.TI]: "TI",
    [SoknadFraType.UTENLANDSKE_MYNDIGH]: "Utenlandske myndigheter",
    [SoknadFraType.VERGE]: "Verge",
    [SoknadFraType.KOMMUNE]: "Kommune",
} as const;
