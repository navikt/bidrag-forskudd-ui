type Nullable<T> = T | null;
type MaybeList<T> = T[] | [];
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
interface GjennomsnittInntekt {
    aarsInntekt: number;
    maanedInntekt: number;
}

interface InntektSomLeggesTilGrunn {
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

interface BarneTilleg {
    periode: Nullable<Periode>;
    barn: Barn;
    brutto: number;
    skattesats: number;
    netto: number;
}

interface UtvidetBarnetrygd {
    periode: Nullable<Partial<Periode>>;
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
    } as InntektData;

    return {
        ...initialData,
        ...data,
    };
};
