import { BehandlingNotatDto, InntektDtoV2, Inntektsrapportering, Inntektstype } from "../api/BidragBehandlingApiV1";

export interface InntektFormPeriode extends Omit<InntektDtoV2, "rapporteringstype"> {
    angittPeriode?: {
        fom?: string;
        til?: string;
    };
    inntektstype?: Inntektstype | "";
    rapporteringstype: Inntektsrapportering | "";
}
export interface InntektFormValues {
    årsinntekter: { [key: string]: InntektFormPeriode[] };
    barnetillegg: { [key: string]: InntektFormPeriode[] };
    småbarnstillegg: InntektFormPeriode[];
    kontantstøtte: { [key: string]: InntektFormPeriode[] };
    utvidetBarnetrygd: InntektFormPeriode[];
    notat?: BehandlingNotatDto;
}
