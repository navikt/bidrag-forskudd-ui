import { RolleDto, RolleType } from "../api/BidragBehandlingApi";

export interface IRolleUI extends RolleDto {
    navn: string;
}

export function mapRolle(rolle: RolleType): string {
    switch (rolle) {
        case RolleType.BIDRAGSMOTTAKER:
            return "BIDRAGSMOTTAKER";
        case RolleType.BIDRAGSPLIKTIG:
            return "BIDRAGSPLIKTIG";
    }
    return rolle;
}
