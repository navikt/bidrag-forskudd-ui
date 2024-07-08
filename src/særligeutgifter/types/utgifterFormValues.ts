import { BehandlingNotatDto, Resultatkode, UtgiftBeregningDto, Utgiftstype } from "@api/BidragBehandlingApiV1";

export interface Utgiftspost {
    dato: string | null;
    type: Utgiftstype | "";
    kravbeløp: number;
    godkjentBeløp: number;
    begrunnelse: string;
    betaltAvBp: boolean;
    id?: number;
    erRedigerbart?: boolean;
}
export interface UtgiftFormValues {
    avslag?: Resultatkode | "";
    beregning?: UtgiftBeregningDto;
    notat: BehandlingNotatDto;
    utgifter: Utgiftspost[];
}
