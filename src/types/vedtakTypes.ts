import { ResultatForskuddsberegning } from "../api/BidragBehandlingApiV1";

export interface VedtakBeregningResult {
    resultat?: ResultatForskuddsberegning;
    feil?: string[];
}
