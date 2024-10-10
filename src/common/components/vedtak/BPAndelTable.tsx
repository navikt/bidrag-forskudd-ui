import { BodyShort, Heading, HStack } from "@navikt/ds-react";

import { formatterBeløpForBeregning, formatterProsent } from "../../../utils/number-utils";
import { useGetBeregningSærbidrag } from "../../hooks/useApiData";
import { CalculationTabell, MathMultiplication, MathValue } from "./CalculationTable";

export const BPsAndel = () => {
    const { data: beregnetSærbidrag } = useGetBeregningSærbidrag();

    const delberegningBpsAndel = beregnetSærbidrag.resultat.bpsAndel;
    const inntekter = beregnetSærbidrag.resultat.inntekter;
    const utgifter = beregnetSærbidrag.resultat.delberegningUtgift;
    return (
        <div>
            <Heading size="xsmall">{"BPs andel"}</Heading>
            <HStack gap={"5"} className="pb-2 w-full">
                <CalculationTabell
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
                                            <MathMultiplication
                                                left="30"
                                                right={beregnetSærbidrag.resultat.forskuddssats}
                                            />
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
                <CalculationTabell
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
                        value: formatterProsent(delberegningBpsAndel.beregnetAndelFaktor),
                    }}
                    message={
                        delberegningBpsAndel.endeligAndelFaktor !== delberegningBpsAndel.beregnetAndelFaktor && (
                            <BodyShort size="small" spacing className="text-red-500">
                                Andel begrenset til {formatterProsent(delberegningBpsAndel.endeligAndelFaktor)}
                            </BodyShort>
                        )
                    }
                />
            </HStack>

            <div>
                Andel utgifter:{" "}
                <MathMultiplication
                    left={`${formatterBeløpForBeregning(utgifter.sumGodkjent, true)}`}
                    right={formatterProsent(delberegningBpsAndel.endeligAndelFaktor)}
                />{" "}
                = {formatterBeløpForBeregning(delberegningBpsAndel.andelBeløp, true)}
            </div>
        </div>
    );
};
