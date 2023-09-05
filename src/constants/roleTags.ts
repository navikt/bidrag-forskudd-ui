import { RolleType } from "../api/BidragBehandlingApi";

export const ROLE_TAGS = {
    [RolleType.BIDRAGSMOTTAKER]: "success",
    [RolleType.BIDRAGSPLIKTIG]: "alt1",
    [RolleType.BARN]: "alt1",
    [RolleType.REELLMOTTAKER]: "alt3",
    [RolleType.FEILREGISTRERT]: "alt3",
} as const;

export const ROLE_FORKORTELSER = {
    [RolleType.BIDRAGSMOTTAKER]: "BM",
    [RolleType.BIDRAGSPLIKTIG]: "BP",
    [RolleType.BARN]: "BA",
    [RolleType.REELLMOTTAKER]: "RM",
    [RolleType.FEILREGISTRERT]: "FR",
} as const;
