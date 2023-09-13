import { RolleDto, RolleDtoRolleType } from "../api/BidragBehandlingApi";

export interface IRolleUI extends RolleDto {
    navn: string;
}

export function mapRolle(rolle: RolleDtoRolleType): string {
    switch (rolle) {
        case RolleDtoRolleType.BIDRAGSMOTTAKER:
            return "BIDRAGSMOTTAKER";
        case RolleDtoRolleType.BIDRAGSPLIKTIG:
            return "BIDRAGSPLIKTIG";
    }
    return rolle;
}
