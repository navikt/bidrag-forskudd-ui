import { RolleType } from "../enum/RolleType";

export const ROLE_TAGS = {
    [RolleType.BM]: "success",
    [RolleType.BP]: "alt1",
    [RolleType.BA]: "alt1",
    [RolleType.RM]: "alt3",
    [RolleType.FR]: "alt3",
} as const;
