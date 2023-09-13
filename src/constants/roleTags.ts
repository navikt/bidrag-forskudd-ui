import { RolleDtoRolleType } from "../api/BidragBehandlingApi";

export const ROLE_TAGS = {
    [RolleDtoRolleType.BIDRAGSMOTTAKER]: "success",
    [RolleDtoRolleType.BIDRAGSPLIKTIG]: "alt1",
    [RolleDtoRolleType.BARN]: "alt1",
    [RolleDtoRolleType.REELMOTTAKER]: "alt3",
    [RolleDtoRolleType.FEILREGISTRERT]: "alt3",
} as const;

export const ROLE_FORKORTELSER = {
    [RolleDtoRolleType.BIDRAGSMOTTAKER]: "BM",
    [RolleDtoRolleType.BIDRAGSPLIKTIG]: "BP",
    [RolleDtoRolleType.BARN]: "BA",
    [RolleDtoRolleType.REELMOTTAKER]: "RM",
    [RolleDtoRolleType.FEILREGISTRERT]: "FR",
} as const;
