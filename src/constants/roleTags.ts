import { RolleType } from "../api/BidragBehandlingApi";

export const ROLE_TAGS = {
    [RolleType.BIDRAGS_MOTTAKER]: "success",
    [RolleType.BIDRAGS_PLIKTIG]: "alt1",
    [RolleType.BARN]: "alt1",
    [RolleType.REELL_MOTTAKER]: "alt3",
    [RolleType.FEILREGISTRERT]: "alt3",
} as const;

export const ROLE_FORKORTELSER = {
    [RolleType.BIDRAGS_MOTTAKER]: "BM",
    [RolleType.BIDRAGS_PLIKTIG]: "BP",
    [RolleType.BARN]: "BA",
    [RolleType.REELL_MOTTAKER]: "RM",
    [RolleType.FEILREGISTRERT]: "FR",
} as const;
