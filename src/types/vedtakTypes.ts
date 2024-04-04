import { BeregningValideringsfeil2, ResultatBeregningBarnDto } from "../api/BidragBehandlingApiV1";

export interface VedtakBeregningResult {
    resultat?: ResultatBeregningBarnDto[];
    feil?: string[];
    feilInnhold?: BeregningValideringsfeil2;
}
