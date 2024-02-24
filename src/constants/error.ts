import text from "../constants/texts";
export const SAK_IKKE_FINNES = "Finnes ikke sak med id {}";
export const PERSON_IKKE_FINNES = "Kunne ikke hente person med ident: {}";
export const GRUNNLAG_BRUKT = "{} fra {} er allerede lagt til grunn.";

export const boforholdPeriodiseringErros = {
    kunneIkkeBeregneSivilstandPerioder: text.error.kunneIkkeBeregneSivilstandPerioder,
    ingenLoependePeriode: text.error.ingenLoependePeriode,
    framoverPeriodisering: text.error.framoverPeriodisering,
    hullIPerioder: text.error.hullIPerioder,
};
