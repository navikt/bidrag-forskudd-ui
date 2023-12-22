import { BehandlingNotatDto, InntektPost } from "../api/BidragBehandlingApiV1";
import { TransformerInntekterResponse } from "../api/BidragInntektApi";

export interface Inntekt {
    inntektstype: string;
    datoFom: string | null;
    taMed: boolean;
    fraGrunnlag: boolean;
    datoTom: string | null;
    beløp: number;
    inntektsposter: InntektPost[];
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
    deltBosted: boolean;
    beløp: number;
}
export interface InntektFormValues {
    inntekteneSomLeggesTilGrunn: { [key: string]: Inntekt[] };
    barnetillegg: BarneTillegFormValues[];
    utvidetbarnetrygd: UtvidetBarnetrygdFormValues[];
    notat?: BehandlingNotatDto;
}

export interface InntektTransformed {
    ident: string;
    data: TransformerInntekterResponse;
}
