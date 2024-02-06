import { BehandlingNotatDto } from "../api/BidragBehandlingApiV1";

export interface VirkningstidspunktFormValues {
    virkningstidspunkt?: string | null;
    årsakAvslag: string | null;
    notat?: BehandlingNotatDto;
}
