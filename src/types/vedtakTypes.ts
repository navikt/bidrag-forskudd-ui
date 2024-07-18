import {
    BeregningValideringsfeil,
    ResultatBeregningBarnDto,
    ResultatSaerbidragsberegningDto,
} from "@api/BidragBehandlingApiV1";

export interface VedtakBeregningFeil {
    melding: string[];
    detaljer?: BeregningValideringsfeil;
}
export interface VedtakBeregningResult {
    resultat?: ResultatBeregningBarnDto[];
    feil?: VedtakBeregningFeil;
}

export interface VedtakSærbidragBeregningResult {
    resultat?: ResultatSaerbidragsberegningDto;
    feil?: VedtakBeregningFeil;
}
