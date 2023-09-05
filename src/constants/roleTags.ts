import { RolleDtoRolleType } from "../api/BidragBehandlingApi";

export const ROLE_TAGS = {
    [RolleDtoRolleType.BM]: "success",
    [RolleDtoRolleType.BP]: "alt1",
    [RolleDtoRolleType.BA]: "alt1",
    [RolleDtoRolleType.RM]: "alt3",
    [RolleDtoRolleType.FR]: "alt3",
} as const;

export const ROLE_FORKORTELSER = {
    [RolleDtoRolleType.BM]: "BM",
    [RolleDtoRolleType.BP]: "BP",
    [RolleDtoRolleType.BA]: "BA",
    [RolleDtoRolleType.RM]: "RM",
    [RolleDtoRolleType.FR]: "FR",
} as const;
