import { ForskuddBeregningKodeAarsakType } from "../api/BidragBehandlingApi";

export interface VirkningstidspunktFormValues {
    virkningsDato?: Date;
    aarsak: ForskuddBeregningKodeAarsakType;
    avslag: string;
    begrunnelseMedIVedtakNotat: string;
    begrunnelseKunINotat: string;
}
