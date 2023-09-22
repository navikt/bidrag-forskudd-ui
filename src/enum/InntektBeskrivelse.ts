export enum GrunnlagInntektType {
    LOENNSINNTEKT = "Lønn",
    KAPITALINNTEKT_EGNE_OPPLYSNINGER = "Kapitalinntekt egne opplysninger",
    PERSONINNTEKT_EGNE_OPPLYSNINGER = "Personinntekt egne opplysninger",
    SAKSBEHANDLER_BEREGNET_INNTEKT = "Saksbehandlers beregnede inntekt",
    NAERINGSINNTEKT = "Næringsinntekt",
    EKSTRA_SMAABARNSTILLEGG = "Småbarnstillegg",
    KONTANTSTOTTE = "Kontantstøtte",
    YTELSE_FRA_OFFENTLIGE = "Ytelse fra offentlige",
}

export enum InntektTypeBeregnet {
    TRE_MAANED_BEREGNET = "3 måneder beregnet",
    TOLV_MAANED_BEREGNET = "12 måneder beregnet",
}

export const InntektBeskrivelse = {
    LOENNSINNTEKT: GrunnlagInntektType.LOENNSINNTEKT,
    EKSTRA_SMAABARNSTILLEGG: GrunnlagInntektType.EKSTRA_SMAABARNSTILLEGG,
    KONTANTSTOTTE: GrunnlagInntektType.KONTANTSTOTTE,
    KAPITALINNTEKT_EGNE_OPPLYSNINGER: GrunnlagInntektType.KAPITALINNTEKT_EGNE_OPPLYSNINGER,
    PERSONINNTEKT_EGNE_OPPLYSNINGER: GrunnlagInntektType.PERSONINNTEKT_EGNE_OPPLYSNINGER,
    NAERINGSINNTEKT: GrunnlagInntektType.NAERINGSINNTEKT,
    YTELSE_FRA_OFFENTLIGE: GrunnlagInntektType.YTELSE_FRA_OFFENTLIGE,
    TRE_MAANED_BEREGNET: InntektTypeBeregnet.TRE_MAANED_BEREGNET,
    TOLV_MAANED_BEREGNET: InntektTypeBeregnet.TOLV_MAANED_BEREGNET,
} as const;
