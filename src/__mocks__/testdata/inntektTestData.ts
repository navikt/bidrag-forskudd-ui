export type Nullable<T> = T | null;
export type MaybeList<T> = T[] | [];
export interface Periode {
    fraDato: string;
    tilDato: string;
}

export interface AndreInntekter {
    aar: string;
    beloep: number;
    tekniskNavn: string;
    selected: boolean;
}
export interface GjennomsnittInntekt {
    aarsInntekt: number;
    maanedInntekt: number;
}

export interface InntektSomLeggesTilGrunn {
    fraDato: string;
    tilDato: string;
    arbeidsgiver: string;
    totalt: number;
    beskrivelse: string;
}

interface Barn {
    foedselnummer: string;
    navn: string;
}

export interface BarneTilleg {
    fraDato: string;
    tilDato: string;
    barn: Barn;
    brutto: number;
    skattesats: number;
    netto: number;
}

export interface UtvidetBarnetrygd {
    fraDato: string;
    tilDato: string;
    deltBosted: boolean;
    beloep: number;
}
export interface InntektData {
    periode: Nullable<Partial<Periode>>;
    gjennomsnittInntektSisteTreMaaneder: Nullable<GjennomsnittInntekt>;
    gjennomsnittInntektSisteTolvMaaneder: Nullable<GjennomsnittInntekt>;
    andreTyperInntekter: MaybeList<AndreInntekter>;
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
        andreTyperInntekter: [
            {
                aar: "2019",
                beloep: 103,
                tekniskNavn: "kapitalinntekt",
                selected: false,
            },
            {
                aar: "2021",
                beloep: 6060,
                tekniskNavn: "kapitalinntekt",
                selected: false,
            },
        ],
        inntekteneSomLeggesTilGrunn: [
            {
                fraDato: "2021-01-01",
                tilDato: "2021-11-05",
                arbeidsgiver: "alle",
                totalt: 208052,
                beskrivelse: "Lønns og trekkopgave",
            },
        ],
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
