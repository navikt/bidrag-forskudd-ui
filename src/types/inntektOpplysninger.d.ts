import { BarnetilleggDto, UtvidetBarnetrygdOgSmaabarnstilleggDto } from "../api/BidragGrunnlagApi";
import { SummertArsinntekt } from "../api/BidragInntektApi";

export interface InntektOpplysninger {
    inntekt: { ident: string; summertAarsinntektListe: SummertArsinntekt[] }[];
    utvidetbarnetrygd: UtvidetBarnetrygdOgSmaabarnstilleggDto[];
    barnetillegg: BarnetilleggDto[];
}
