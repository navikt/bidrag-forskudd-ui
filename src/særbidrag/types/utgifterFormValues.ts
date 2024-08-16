import { Resultatkode, UtgiftBeregningDto, Utgiftstype } from "@api/BidragBehandlingApiV1";

export interface Utgiftspost {
    dato: string | null;
    type: Utgiftstype | "" | string;
    kravbeløp: number;
    godkjentBeløp: number;
    kommentar: string;
    betaltAvBp: boolean;
    id?: number;
    erRedigerbart?: boolean;
}
export interface UtgiftFormValues {
    avslag?: Resultatkode | "";
    beregning?: UtgiftBeregningDto;
    begrunnelse: string;
    utgifter: Utgiftspost[];
}
