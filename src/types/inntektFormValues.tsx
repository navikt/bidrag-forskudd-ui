import { Barn } from "../__mocks__/testdata/inntektTestData";

export interface InntektSomLeggesTilGrunnFormValues {
    aar?: string;
    beskrivelse: string;
    fraDato: Date | null;
    fraPostene: boolean;
    selected: boolean;
    tekniskNavn: string;
    tilDato: Date | null;
    totalt: string;
}

export interface BarneTillegFormValues {
    fraDato: Date | null;
    tilDato: Date | null;
    barn: Barn;
    brutto: string;
    skattesats: string;
    netto: string;
}

export interface UtvidetBarnetrygdFormValues {
    fraDato: Date | null;
    tilDato: Date | null;
    deltBosted: boolean;
    beloep: string;
}
export interface InntektFormValues {
    periodeFra: Date | null;
    periodeTil: Date | null;
    inntekteneSomLeggesTilGrunn: InntektSomLeggesTilGrunnFormValues[];
    barnetillegg: BarneTillegFormValues[];
    utvidetBarnetrygd: UtvidetBarnetrygdFormValues[];
    begrunnelseIVedtaket: string;
    begrunnelseINotat: string;
    toTrinnsKontroll: boolean;
}
