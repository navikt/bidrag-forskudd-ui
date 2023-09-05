import { RolleDto, RolleDtoRolleType } from "../api/BidragBehandlingApi";

export interface IRolleUI extends RolleDto {
    navn: string;
}

export function mapRolle(rolle: RolleDtoRolleType): string {
    switch (rolle) {
        case RolleDtoRolleType.BM:
            return "BIDRAGSMOTTAKER";
        case RolleDtoRolleType.BP:
            return "BIDRAGSPLIKTIG";
    }
    return rolle;
}
