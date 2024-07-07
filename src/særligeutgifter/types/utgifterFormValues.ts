import {
    BehandlingNotatDto,
    Resultatkode,
    UtgiftBeregningDto,
    UtgiftspostDtoTypeEnum,
} from "@api/BidragBehandlingApiV1";

export interface Utgiftspost {
    dato: string | null;
    type: UtgiftspostDtoTypeEnum | "";
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
