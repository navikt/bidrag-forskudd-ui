import { ForskuddAarsakType } from "../api/BidragBehandlingApiV1";

export interface VirkningstidspunktFormValues {
    virkningsdato?: string | null;
    getårsak: ForskuddAarsakType | "";
    virkningstidspunktsbegrunnelseIVedtakOgNotat: string;
    virkningstidspunktsbegrunnelseKunINotat: string;
}
