import { ForskuddAarsakType } from "../api/BidragBehandlingApiV1";

export interface VirkningstidspunktFormValues {
    virkningsdato?: string | null;
    årsak: ForskuddAarsakType | "";
    virkningstidspunktsbegrunnelseIVedtakOgNotat: string;
    virkningstidspunktsbegrunnelseKunINotat: string;
}
