import { BeregningValideringsfeil, ResultatBeregningBarnDto } from "@api/BidragBehandlingApiV1";

export interface VedtakBeregningResult {
    resultat?: ResultatBeregningBarnDto[];
    feil?: {
        melding: string[];
        detaljer?: BeregningValideringsfeil;
    };
}
