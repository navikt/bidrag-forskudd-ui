import { BehandlingNotatDto, InntektDtoV2, TransformerInntekterResponse } from "../api/BidragBehandlingApiV1";

export interface InntektFormValues {
    årsinntekter: { [key: string]: InntektDtoV2[] };
    barnetillegg: { [key: string]: InntektDtoV2[] };
    småbarnstillegg: InntektDtoV2[];
    kontantstøtte: { [key: string]: InntektDtoV2[] };
    utvidetBarnetrygd: InntektDtoV2[];
    notat?: BehandlingNotatDto;
}

export interface InntektTransformed {
    ident: string;
    data: TransformerInntekterResponse;
}
