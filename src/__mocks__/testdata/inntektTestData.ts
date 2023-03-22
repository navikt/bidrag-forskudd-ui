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
    fraDato: string;
    tilDato: string;
    totalt: number;
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
        periode: {
            fraDato: "2021-11-05",
            tilDato: "2022-10-05",
        },
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
        begrunnelseIVedtaket:
            "Du har en månedslønn på 41 250,- kroner, inkludert skattepliktig fordel. I tillegg har du mottatt bonus med 27 500,- kroner, og ferietillegg med 26 643,- kroner.\n" +
            "Omregnet til årsinntekt utgjør dette (41250kr x 12mnd + 27500kr + 26643kr) 549 143,- kroner, som NAV legger til grunn.\n" +
            "Du mottar utvidet barnetrygd med 12 648,- kroner per år.\n" +
            "Fra 1. september 2022 mottar du kontantstøtte med 90 000,- kroner per år.\n",
        begrunnelseINotat: "",
        toTrinnsKontroll: false,
    } as InntektData;

    return {
        ...initialData,
        ...data,
    };
};
