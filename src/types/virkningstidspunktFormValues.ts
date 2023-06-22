import { ForskuddAarsakType } from "../api/BidragBehandlingApi";

export interface VirkningstidspunktFormValues {
    virkningsDato?: Date;
    aarsak: ForskuddAarsakType | "";
    virkningsTidspunktBegrunnelseMedIVedtakNotat: string;
    virkningsTidspunktBegrunnelseKunINotat: string;
}
