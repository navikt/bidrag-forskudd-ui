import { BehandlingNotatDto, Resultatkode, UtgiftBeregningDto, Utgiftstype } from "@api/BidragBehandlingApiV1";

export interface Utgiftspost {
    dato: string | null;
    type: Utgiftstype | "" | string;
    kravbeløp: number;
    godkjentBeløp: number;
    begrunnelse: string;
    betaltAvBp: boolean;
    id?: number;
    utgiftstypeVisningsnavn?: string;
    erRedigerbart?: boolean;
}
export interface UtgiftFormValues {
    avslag?: Resultatkode | "";
    beregning?: UtgiftBeregningDto;
    notat: BehandlingNotatDto;
    utgifter: Utgiftspost[];
}
