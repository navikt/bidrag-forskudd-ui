export interface Inntekt {
    beskrivelse: string;
    datoFom: Date | null;
    taMed: boolean;
    fraGrunnlag: boolean;
    datoTom: Date | null;
    belop: string;
}

export interface BarneTillegFormValues {
    datoFom: Date | null;
    datoTom: Date | null;
    ident: string;
    barnetillegg: number;
}

export interface UtvidetBarnetrygdFormValues {
    datoFom: Date | null;
    datoTom: Date | null;
    deltBoSted: boolean;
    belop: number;
}
export interface InntektFormValues {
    inntekteneSomLeggesTilGrunn: { [key: string]: Inntekt[] };
    barnetillegg: BarneTillegFormValues[];
    utvidetBarnetrygd: UtvidetBarnetrygdFormValues[];
    inntektBegrunnelseMedIVedtakNotat: string;
    inntektBegrunnelseKunINotat: string;
}
