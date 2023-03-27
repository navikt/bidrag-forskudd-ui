import { AvslagType, ForskuddBeregningKodeAarsakType } from "../api/BidragBehandlingApi";

export interface VirkningstidspunktFormValues {
    virkningsDato?: Date;
    aarsak: ForskuddBeregningKodeAarsakType;
    avslag: AvslagType;
    begrunnelseMedIVedtakNotat: string;
    begrunnelseKunINotat: string;
}
