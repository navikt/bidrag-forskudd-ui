export enum GrunnlagInntektType {
    LØNN_MANUELT_BEREGNET = "Lønn manuelt beregnet",
    KAPITALINNTEKT_EGNE_OPPLYSNINGER = "Kapitalinntekt egne opplysninger",
    PERSONINNTEKT_EGNE_OPPLYSNINGER = "Personinntekt egne opplysninger",
    SAKSBEHANDLER_BEREGNET_INNTEKT = "Saksbehandlers beregnede inntekt",
    NÆRINGSINNTEKT_MANUELT_BEREGNET = "Næringsinntekt",
    EKSTRA_SMAABARNSTILLEGG = "Småbarnstillegg",
    KONTANTSTØTTE = "Kontantstøtte",
    YTELSE_FRA_OFFENTLIG_MANUELT_BEREGNET = "Ytelse fra offentlige",
}

export enum InntektTypeBeregnet {
    TRE_MAANED_BEREGNET = "3 måneder beregnet",
    TOLV_MAANED_BEREGNET = "12 måneder beregnet",
}

export const InntektBeskrivelse = {
    LOENNSINNTEKT: GrunnlagInntektType.LØNN_MANUELT_BEREGNET,
    EKSTRA_SMAABARNSTILLEGG: GrunnlagInntektType.EKSTRA_SMAABARNSTILLEGG,
    KONTANTSTØTTE: GrunnlagInntektType.KONTANTSTØTTE,
    KAPITALINNTEKT_EGNE_OPPLYSNINGER: GrunnlagInntektType.KAPITALINNTEKT_EGNE_OPPLYSNINGER,
    PERSONINNTEKT_EGNE_OPPLYSNINGER: GrunnlagInntektType.PERSONINNTEKT_EGNE_OPPLYSNINGER,
    NAERINGSINNTEKT: GrunnlagInntektType.NÆRINGSINNTEKT_MANUELT_BEREGNET,
    YTELSE_FRA_OFFENTLIGE: GrunnlagInntektType.YTELSE_FRA_OFFENTLIG_MANUELT_BEREGNET,
    TRE_MAANED_BEREGNET: InntektTypeBeregnet.TRE_MAANED_BEREGNET,
    TOLV_MAANED_BEREGNET: InntektTypeBeregnet.TOLV_MAANED_BEREGNET,
} as const;
