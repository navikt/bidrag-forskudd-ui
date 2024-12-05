import {
    StonadTilBarnetilsynDtoSkolealderEnum,
    StonadTilBarnetilsynDtoTilsynstypeEnum,
} from "@api/BidragBehandlingApiV1";

export const STONAD_TIL_BARNETILSYNS_TYPE = {
    [StonadTilBarnetilsynDtoTilsynstypeEnum.DELTID]: "Deltid",
    [StonadTilBarnetilsynDtoTilsynstypeEnum.HELTID]: "Heltid",
} as const;

export const STONAD_TIL_BARNETILSYNS_SKOLEALDER = {
    [StonadTilBarnetilsynDtoSkolealderEnum.OVER]: "Over skolealder",
    [StonadTilBarnetilsynDtoSkolealderEnum.UNDER]: "Under skolealder",
} as const;
