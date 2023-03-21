export const gjennomsnitPerioder = ["gjennomsnitt_siste_tre_maaneder", "gjennomsnitt_siste_tolv_maaneder"];
export const perioderSomIkkeKanOverlape = ["skattegrunnlag", "loenn_og_trekk", ...gjennomsnitPerioder];

export const perioderSomKanOverlape = ["kapitalinntekt", "næringsinntekt"];
export const innhentendeTotalsummertInntekter = [...perioderSomKanOverlape, ...perioderSomIkkeKanOverlape];
export const enkeltinntekter = ["foreldrepenger", "dagpenger", "pensjon"];
