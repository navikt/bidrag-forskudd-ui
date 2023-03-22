export const gjennomsnittPerioder = ["gjennomsnitt_siste_tre_maaneder", "gjennomsnitt_siste_tolv_maaneder"];
export const ytelsePerioder = ["skattegrunnlag", "loenn_og_trekk"];
export const perioderSomIkkeKanOverlape = [...ytelsePerioder, ...gjennomsnittPerioder];

export const perioderSomKanIkkeOverlapeKunMedHverandre = ["kapitalinntekt", "næringsinntekt"];
export const innhentendeTotalsummertInntekter = [
    ...perioderSomKanIkkeOverlapeKunMedHverandre,
    ...perioderSomIkkeKanOverlape,
];
export const enkeltinntekter = ["foreldrepenger", "dagpenger", "pensjon"];
