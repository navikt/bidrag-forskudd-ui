import { Rolletype, TypeBehandling } from "../../api/BidragBehandlingApiV1";

export enum InntektTableType {
    SKATTEPLIKTIG = "SKATTEPLIKTIG",
    UTVIDET_BARNETRYGD = "UTVIDET_BARNETRYGD",
    SMÅBARNSTILLEGG = "SMÅBARNSTILLEGG",
    KONTANTSTØTTE = "KONTANTSTØTTE",
    BARNETILLEGG = "BARNETILLEGG",
    BEREGNET_INNTEKTER = "BEREGNET_INNTEKTER",
    TOTAL_INNTEKTER = "TOTAL_INNTEKTER",
}
export const inntekterTablesViewRules = {
    [TypeBehandling.SAeRBIDRAG]: {
        [Rolletype.BM]: [
            InntektTableType.SKATTEPLIKTIG,
            InntektTableType.BARNETILLEGG,
            InntektTableType.UTVIDET_BARNETRYGD,
            InntektTableType.SMÅBARNSTILLEGG,
            InntektTableType.KONTANTSTØTTE,
            InntektTableType.BEREGNET_INNTEKTER,
        ],
        [Rolletype.BP]: [
            InntektTableType.SKATTEPLIKTIG,
            InntektTableType.BARNETILLEGG,
            InntektTableType.BEREGNET_INNTEKTER,
        ],
        [Rolletype.BA]: [InntektTableType.SKATTEPLIKTIG, InntektTableType.BEREGNET_INNTEKTER],
    },
    [TypeBehandling.FORSKUDD]: {
        [Rolletype.BM]: [
            InntektTableType.SKATTEPLIKTIG,
            InntektTableType.BARNETILLEGG,
            InntektTableType.UTVIDET_BARNETRYGD,
            InntektTableType.SMÅBARNSTILLEGG,
            InntektTableType.KONTANTSTØTTE,
            InntektTableType.BEREGNET_INNTEKTER,
        ],
        [Rolletype.BP]: [],
        [Rolletype.BA]: [InntektTableType.SKATTEPLIKTIG],
    },
};

// export const InntektTableComponent = {
//     [InntektTableType.SKATTEPLIKTIG]: (ident: string) => <SkattepliktigeOgPensjonsgivende ident={ident} />,
//     [InntektTableType.UTVIDET_BARNETRYGD]: () => <UtvidetBarnetrygd />,
//     [InntektTableType.SMÅBARNSTILLEGG]: <Småbarnstillegg />,
//     [InntektTableType.KONTANTSTØTTE]: <Kontantstøtte />,
//     [InntektTableType.BARNETILLEGG]: <Barnetillegg />,
//     [InntektTableType.BEREGNET_INNTEKTER]: "BeregnetInntekter",
// };
