export enum GrunnlagInntektType {
    LOENNSINNTEKT = "Lønn",
    NAERINGSINNTEKT = "Næringsinntekt",
    PENSJON_ELLER_TRYGD = "Pensjon eller trygd",
    YTELSE_FRA_OFFENTLIGE = "Ytelse fra offentlige",
}

export enum InntektTypeBeregnet {
    TRE_MAANED_BEREGNET = "3 måneder beregnet",
    TOLV_MAANED_BEREGNET = "12 måneder beregnet",
}

export const InntektBeskrivelse = {
    LOENNSINNTEKT: GrunnlagInntektType.LOENNSINNTEKT,
    NAERINGSINNTEKT: GrunnlagInntektType.NAERINGSINNTEKT,
    PENSJON_ELLER_TRYGD: GrunnlagInntektType.PENSJON_ELLER_TRYGD,
    YTELSE_FRA_OFFENTLIGE: GrunnlagInntektType.YTELSE_FRA_OFFENTLIGE,
    TRE_MAANED_BEREGNET: InntektTypeBeregnet.TRE_MAANED_BEREGNET,
    TOLV_MAANED_BEREGNET: InntektTypeBeregnet.TOLV_MAANED_BEREGNET,
} as const;
