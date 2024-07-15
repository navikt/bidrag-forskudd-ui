import { BehandlingNotatDto, InntektDtoV2, Inntektsrapportering, Inntektstype } from "@api/BidragBehandlingApiV1";

export interface InntektFormPeriode extends Omit<InntektDtoV2, "rapporteringstype"> {
    angittPeriode?: {
        fom?: string;
        til?: string;
    };
    inntektstype?: Inntektstype | "";
    rapporteringstype: Inntektsrapportering | "";
    beløpMnd?: number;
    erRedigerbart?: boolean;
    kanRedigeres?: boolean;
}
export interface InntektFormValues {
    årsinntekter: { [key: string]: InntektFormPeriode[] };
    barnetillegg: { [key: string]: { [key: string]: InntektFormPeriode[] } };
    småbarnstillegg: { [key: string]: InntektFormPeriode[] };
    kontantstøtte: { [key: string]: { [key: string]: InntektFormPeriode[] } };
    utvidetBarnetrygd: { [key: string]: InntektFormPeriode[] };
    notat?: BehandlingNotatDto;
}
