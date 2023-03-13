import { Barn, MaybeList } from "../__mocks__/testdata/inntektTestData";

export interface InntektSomLeggesTilGrunnFormValues {
    fraDato: Date | null;
    tilDato: Date | null;
    totalt: string;
    beskrivelse: string;
    selected: boolean;
    fraPostene: boolean;
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
    inntekteneSomLeggesTilGrunn: MaybeList<InntektSomLeggesTilGrunnFormValues>;
    barnetillegg: MaybeList<BarneTillegFormValues>;
    utvidetBarnetrygd: MaybeList<UtvidetBarnetrygdFormValues>;
    begrunnelseIVedtaket: string;
    begrunnelseINotat: string;
    toTrinnsKontroll: boolean;
}
