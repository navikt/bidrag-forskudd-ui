import { ForskuddBeregningKodeAarsak } from "../enum/ForskuddBeregningKodeAarsak";

export interface VirkningstidspunktFormValues {
    virkningstidspunkt?: Date;
    aarsak: ForskuddBeregningKodeAarsak;
    avslag: string;
    begrunnelseMedIVedtakNotat: string;
    begrunnelseKunINotat: string;
}
