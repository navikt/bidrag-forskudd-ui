import { Barn } from "../__mocks__/testdata/inntektTestData";

export interface Inntekt {
    beskrivelse: string;
    datoFom: Date | null;
    taMed: boolean;
    fraPostene: boolean;
    datoTom: Date | null;
    belop: string;
}

export interface BarneTillegFormValues {
    fraDato: Date | null;
    tilDato: Date | null;
    barn: Barn;
    beloep: number;
}

export interface UtvidetBarnetrygdFormValues {
    fraDato: Date | null;
    tilDato: Date | null;
    deltBosted: boolean;
    beloep: number;
}
export interface InntektFormValues {
    inntekteneSomLeggesTilGrunn: { [key: string]: Inntekt[] };
    barnetillegg: BarneTillegFormValues[];
    utvidetBarnetrygd: UtvidetBarnetrygdFormValues[];
    inntektBegrunnelseMedIVedtakNotat: string;
    inntektBegrunnelseKunINotat: string;
}
