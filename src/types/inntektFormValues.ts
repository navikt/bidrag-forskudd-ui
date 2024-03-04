import { BehandlingNotatDto, InntektDtoV2, Inntektstype } from "../api/BidragBehandlingApiV1";

interface InntektFormPeriode extends InntektDtoV2 {
    angittPeriode?: {
        fom?: string;
        til?: string;
    };
    inntektstype?: Inntektstype | "";
}
export interface InntektFormValues {
    årsinntekter: { [key: string]: InntektFormPeriode[] };
    barnetillegg: { [key: string]: InntektFormPeriode[] };
    småbarnstillegg: InntektFormPeriode[];
    kontantstøtte: { [key: string]: InntektFormPeriode[] };
    utvidetBarnetrygd: InntektFormPeriode[];
    notat?: BehandlingNotatDto;
}
