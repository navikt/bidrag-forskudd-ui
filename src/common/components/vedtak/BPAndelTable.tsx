import { BodyShort, Heading, HStack } from "@navikt/ds-react";

import {
    BidragPeriodeBeregningsdetaljer,
    DelberegningBidragspliktigesAndel,
    ResultatSaerbidragsberegningInntekterDto,
} from "../../../api/BidragBehandlingApiV1";
import { formatterBeløpForBeregning, formatterProsent } from "../../../utils/number-utils";
import { useGetBeregningSærbidrag } from "../../hooks/useApiData";
import {
    CalculationTabell,
    CalculationTabellV2,
    MathDivision,
    MathMultiplication,
    MathValue,
} from "./CalculationTable";
import { ResultatTable } from "./ResultatTable";

export const BPsAndelUtgifter = () => {
    const { data: beregnetSærbidrag } = useGetBeregningSærbidrag();

    const bpsAndel = beregnetSærbidrag.resultat.bpsAndel;
    const inntekter = beregnetSærbidrag.resultat.inntekter;
    const utgifter = beregnetSærbidrag.resultat.delberegningUtgift;
    return (
        <>
            <Heading size="xsmall">{"BPs andel"}</Heading>
            <HStack gap={"5"} className="pb-2 w-full">
                <BeregningTotalinntektTable
                    inntekter={inntekter}
                    forskuddssats={beregnetSærbidrag.resultat.forskuddssats}
                />
                <CalculationTabell
                    title="Beregning av BPs andel prosent"
                    data={[
                        {
                            label: "BPs inntekt",
                            result: formatterBeløpForBeregning(inntekter.inntektBP, true),
                        },
                        {
                            label: "Total inntekt",
                            result: (
                                <div className="flex flex-row justify-end gap-1">
                                    <div>&#247;</div>
                                    {formatterBeløpForBeregning(inntekter.totalEndeligInntekt, true)}
                                </div>
                            ),
                        },
                    ]}
                    result={{
                        label: "BPs andel",
                        value: formatterProsent(bpsAndel.beregnetAndelFaktor),
                    }}
                    message={
                        bpsAndel.endeligAndelFaktor !== bpsAndel.beregnetAndelFaktor && (
                            <BodyShort size="small" spacing className="text-red-500">
                                Andel begrenset til {formatterProsent(bpsAndel.endeligAndelFaktor)}
                            </BodyShort>
                        )
                    }
                />
            </HStack>

            <div>
                Andel utgifter:{" "}
                <MathMultiplication
                    left={`${formatterBeløpForBeregning(utgifter.sumGodkjent, true)}`}
                    right={formatterProsent(bpsAndel.endeligAndelFaktor)}
                />{" "}
                = {formatterBeløpForBeregning(bpsAndel.andelBeløp, true)}
            </div>
        </>
    );
};

type BPsAndelProps = {
    inntekter: ResultatSaerbidragsberegningInntekterDto;
    bpsAndel: DelberegningBidragspliktigesAndel;
    forskuddssats: number;
};

const BeregningTotalinntektTable = ({
    inntekter,
    forskuddssats,
}: Omit<BPsAndelProps, "bpsAndel" | "delberegningUnderholdskostnad">) => {
    return (
        <CalculationTabell
            title="Beregning av total inntekt"
            data={[
                {
                    label: "BPs inntekt",
                    result: formatterBeløpForBeregning(inntekter.inntektBP, true),
                },
                {
                    label: "BMs inntekt",
                    result: formatterBeløpForBeregning(inntekter.inntektBM, true),
                },
                {
                    label: "BAs inntekt",
                    value: (
                        <>
                            {inntekter.inntektBarn > 0 && (
                                <BodyShort size="small">
                                    <MathValue value={inntekter.inntektBarn} /> -{" "}
                                    <MathMultiplication left="30" right={forskuddssats} />
                                </BodyShort>
                            )}
                        </>
                    ),
                    result: formatterBeløpForBeregning(inntekter.barnEndeligInntekt, true),
                },
            ]}
            result={{
                label: "Total inntekt",
                value: formatterBeløpForBeregning(inntekter.totalEndeligInntekt, true),
            }}
        />
    );
};

type DetaljertBeregningBidragProps = {
    beregningsdetaljer: BidragPeriodeBeregningsdetaljer;
};
export const BPsAndelUnderholdskostnad = ({ beregningsdetaljer }: DetaljertBeregningBidragProps) => {
    const bpsAndel = beregningsdetaljer.bpsAndel;
    const inntekter = beregningsdetaljer.inntekter;
    const delberegningUnderholdskostnad = beregningsdetaljer.delberegningUnderholdskostnad;
    return (
        <>
            <Heading size="xsmall">{"BPs andel"}</Heading>
            <BeregningTotalinntektTableV2 inntekter={inntekter} forskuddssats={beregningsdetaljer.forskuddssats} />
            <div>
                <ResultatTable
                    data={[
                        generateBpsAndelSection(inntekter, bpsAndel),
                        {
                            label: "Andel underholdskostnad",
                            textRight: false,
                            value: (
                                <div className="inline">
                                    <MathMultiplication
                                        left={`${formatterBeløpForBeregning(delberegningUnderholdskostnad.underholdskostnad, true)}`}
                                        right={formatterProsent(bpsAndel.endeligAndelFaktor)}
                                    />{" "}
                                    = {formatterBeløpForBeregning(bpsAndel.andelBeløp, true)}
                                </div>
                            ),
                        },
                    ].filter((d) => d)}
                />
                {bpsAndel.endeligAndelFaktor !== bpsAndel.beregnetAndelFaktor && (
                    <BodyShort size="small" spacing className="text-red-500 pl-[3px]">
                        Andel begrenset til {formatterProsent(bpsAndel.endeligAndelFaktor)}
                    </BodyShort>
                )}
            </div>
        </>
    );
};

const BeregningTotalinntektTableV2 = ({
    inntekter,
    forskuddssats,
}: Omit<BPsAndelProps, "bpsAndel" | "delberegningUnderholdskostnad">) => {
    return (
        <CalculationTabellV2
            data={[
                {
                    label: "BPs inntekt",
                    result: formatterBeløpForBeregning(inntekter.inntektBP, true),
                },
                {
                    label: "BMs inntekt",
                    result: formatterBeløpForBeregning(inntekter.inntektBM, true),
                },
                {
                    label: "BAs inntekt",
                    value: (
                        <>
                            {inntekter.inntektBarn > 0 && (
                                <BodyShort size="small">
                                    <MathValue value={inntekter.inntektBarn} /> -{" "}
                                    <MathMultiplication left="30" right={forskuddssats} />
                                </BodyShort>
                            )}
                        </>
                    ),
                    result: formatterBeløpForBeregning(inntekter.barnEndeligInntekt, true),
                },
            ]}
            result={{
                label: "Total inntekt",
                value: formatterBeløpForBeregning(inntekter.totalEndeligInntekt, true),
            }}
        />
    );
};
const generateBpsAndelSection = (
    inntekter: ResultatSaerbidragsberegningInntekterDto,
    bpsAndel: DelberegningBidragspliktigesAndel
) => ({
    label: "BP's andel av underholdskostnad (i prosent)",
    textRight: false,
    value: (
        <div className="inline">
            <div>
                <MathDivision
                    top={formatterBeløpForBeregning(inntekter.inntektBP, true)}
                    bottom={formatterBeløpForBeregning(inntekter.totalEndeligInntekt, true)}
                />{" "}
                = <MathValue value={formatterProsent(bpsAndel.beregnetAndelFaktor)} />
            </div>
        </div>
    ),
});
