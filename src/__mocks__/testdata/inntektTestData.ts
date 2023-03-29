export type Nullable<T> = T | null;
export type MaybeList<T> = T[] | [];
export interface Periode {
    fraDato: string;
    tilDato: string;
}
export interface GjennomsnittInntekt {
    aarsInntekt: number;
    maanedInntekt: number;
}

export interface InntektSomLeggesTilGrunn {
    fraDato: string | null;
    tilDato: string | null;
    totalt: number | string;
    beskrivelse: string;
    aar: string;
    tekniskNavn: string;
    fraPostene: boolean;
}

export interface Barn {
    foedselnummer: string;
    navn: string;
}

export interface BarneTilleg {
    fraDato: Date | string;
    tilDato: Date | string;
    barn: Barn;
    beloep: number;
}

export interface UtvidetBarnetrygd {
    fraDato: Date | string;
    tilDato: Date | string;
    deltBosted: boolean;
    beloep: number;
}
export interface InntektData {
    periode: Nullable<Partial<Periode>>;
    gjennomsnittInntektSisteTreMaaneder: Nullable<GjennomsnittInntekt>;
    gjennomsnittInntektSisteTolvMaaneder: Nullable<GjennomsnittInntekt>;
    inntekteneSomLeggesTilGrunn: MaybeList<InntektSomLeggesTilGrunn>;
    barnetillegg: MaybeList<BarneTilleg>;
    utvidetBarnetrygd: MaybeList<UtvidetBarnetrygd>;
    begrunnelseIVedtaket: string;
    begrunnelseINotat: string;
    toTrinnsKontroll: boolean;
}
export const inntektData = (data = {}) => {
    const initialData = {
        gjennomsnittInntektSisteTreMaaneder: {
            aarsInntekt: 495000,
            maanedInntekt: 48500,
        },
        gjennomsnittInntektSisteTolvMaaneder: {
            aarsInntekt: 520000,
            maanedInntekt: 50500,
        },
        inntekteneSomLeggesTilGrunn: [],
        barnetillegg: [],
        utvidetBarnetrygd: [],
        begrunnelseIVedtaket: "",
        begrunnelseINotat: "",
        toTrinnsKontroll: false,
    } as InntektData;

    return {
        ...initialData,
        ...data,
    };
};
