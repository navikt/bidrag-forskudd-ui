import { InntektPost } from "../api/BidragBehandlingApi";
import { TransformerInntekterResponse } from "../api/BidragInntektApi";

export interface Inntekt {
    inntektBeskrivelse: string;
    inntektType: string;
    datoFom: string | null;
    taMed: boolean;
    fraGrunnlag: boolean;
    datoTom: string | null;
    belop: number;
    inntektPostListe: InntektPost[];
}

export interface BarneTillegFormValues {
    datoFom?: string | null;
    datoTom?: string | null;
    ident: string;
    barnetillegg: number;
}

export interface UtvidetBarnetrygdFormValues {
    datoFom?: string;
    datoTom?: string;
    deltBoSted: boolean;
    belop: number;
}
export interface InntektFormValues {
    inntekteneSomLeggesTilGrunn: { [key: string]: Inntekt[] };
    barnetillegg: BarneTillegFormValues[];
    utvidetbarnetrygd: UtvidetBarnetrygdFormValues[];
    inntektBegrunnelseMedIVedtakNotat: string;
    inntektBegrunnelseKunINotat: string;
}

export interface InntektTransformed {
    ident: string;
    data: TransformerInntekterResponse;
}
