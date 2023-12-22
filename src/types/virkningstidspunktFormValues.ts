import { BehandlingNotatDto, ForskuddAarsakType } from "../api/BidragBehandlingApiV1";

export interface VirkningstidspunktFormValues {
    virkningsdato?: string | null;
    årsak: ForskuddAarsakType | "";
    notat?: BehandlingNotatDto;
}
