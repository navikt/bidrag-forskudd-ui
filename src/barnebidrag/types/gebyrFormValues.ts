import { GebyrRolleDto } from "@api/BidragBehandlingApiV1";

export enum EndeligIlagtGebyr {
    Ilagt = "ILAGT",
    Fritatt = "FRITATT",
}
interface GebyrRolle extends Omit<GebyrRolleDto, "endeligIlagtGebyr"> {
    endeligIlagtGebyr: EndeligIlagtGebyr;
}
export interface GebyrFormValues {
    gebyrRoller: GebyrRolle[];
}
