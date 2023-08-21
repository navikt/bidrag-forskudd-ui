import { RolleDto, RolleType } from "../api/BidragBehandlingApi";

export interface IRolleUI extends RolleDto {
    navn: string;
}

export function mapRolle(rolle: RolleType): string {
    switch (rolle) {
        case RolleType.BIDRAGS_MOTTAKER:
            return "BIDRAGSMOTTAKER";
        case RolleType.BIDRAGS_PLIKTIG:
            return "BIDRAGSPLIKTIG";
    }
    return rolle;
}
