import {
    Bostatuskode,
    Grunnlag,
    Grunnlagstype,
    ResultatPeriode,
    Sivilstandskode,
} from "../../../api/BidragBehandlingApiV1";

const grunnlagForPeriode = (referanseListe: string[], grunnlagsListe: Grunnlag[]): Grunnlag[] =>
    grunnlagsListe.filter((grunnlag) => referanseListe.includes(grunnlag.referanse));
export const mapToSivilstand = (periode: ResultatPeriode, grunnlagsListe: Grunnlag[]): Sivilstandskode => {
    const grunnlagslistePeriode = grunnlagForPeriode(periode.grunnlagsreferanseListe, grunnlagsListe);
    const innhold = grunnlagslistePeriode.find((grunnlag) => grunnlag.type == Grunnlagstype.SIVILSTAND_PERIODE)
        ?.innhold;
    return innhold["sivilstand"];
};
export const mapToInntekt = (periode: ResultatPeriode, grunnlagsListe: Grunnlag[]): number => {
    const grunnlagslistePeriode = grunnlagForPeriode(periode.grunnlagsreferanseListe, grunnlagsListe);
    const inntekter = grunnlagslistePeriode
        .filter((grunnlag) => grunnlag.type == Grunnlagstype.BEREGNING_INNTEKT_RAPPORTERING_PERIODE)
        .map((inntekt) => inntekt.innhold);
    return inntekter.reduce((prev, curr) => curr["beløp"] + prev, 0);
};
export const mapToAntallBarnIHusstand = (periode: ResultatPeriode, grunnlagsListe: Grunnlag[]): number => {
    const grunnlagslistePeriode = grunnlagForPeriode(periode.grunnlagsreferanseListe, grunnlagsListe);
    const bostatusPerioder = grunnlagslistePeriode
        .filter((grunnlag) => grunnlag.type == Grunnlagstype.BOSTATUS_PERIODE)
        .filter(
            (grunnlag) =>
                grunnlag.innhold["bostatus"] == Bostatuskode.MED_FORELDER ||
                grunnlag.innhold["bostatus"] == Bostatuskode.DOKUMENTERT_SKOLEGANG
        );
    return bostatusPerioder.length;
};
