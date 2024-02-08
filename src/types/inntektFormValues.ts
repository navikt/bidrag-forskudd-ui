import { BehandlingNotatDto, InntektDtoV2 } from "../api/BidragBehandlingApiV1";
import { TransformerInntekterResponse } from "../api/BidragInntektApi";

export interface InntektFormValues {
    årsinntekter: { [key: string]: InntektDtoV2[] };
    barnetillegg: InntektDtoV2[];
    småbarnstillegg: InntektDtoV2[];
    kontantstøtte: InntektDtoV2[];
    barnetilsyn: InntektDtoV2[];
    notat?: BehandlingNotatDto;
}

export interface InntektTransformed {
    ident: string;
    data: TransformerInntekterResponse;
}
