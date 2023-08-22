import { ForskuddAarsakType } from "../api/BidragBehandlingApi";

export interface VirkningstidspunktFormValues {
    virkningsDato?: string | null;
    aarsak: ForskuddAarsakType | "";
    virkningsTidspunktBegrunnelseMedIVedtakNotat: string;
    virkningsTidspunktBegrunnelseKunINotat: string;
}
