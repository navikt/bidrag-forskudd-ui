export interface Inntekt {
    inntektType: string;
    datoFom: string | null;
    taMed: boolean;
    fraGrunnlag: boolean;
    datoTom: string | null;
    belop: number;
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
