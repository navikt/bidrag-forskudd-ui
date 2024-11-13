import { BodyShort, Heading, HStack } from "@navikt/ds-react";

import { BPsAndelInntekterTable } from "../../../common/components/vedtak/BPsAndelInntekterTable";
import { CalculationTabell, MathMultiplication } from "../../../common/components/vedtak/CalculationTable";
import { useGetBeregningSærbidrag } from "../../../common/hooks/useApiData";
import { formatterBeløpForBeregning, formatterProsent } from "../../../utils/number-utils";

export const BPsAndelUtgifter = () => {
    const { data: beregnetSærbidrag } = useGetBeregningSærbidrag();

    const bpsAndel = beregnetSærbidrag.resultat.bpsAndel;
    const inntekter = beregnetSærbidrag.resultat.inntekter;
    const utgifter = beregnetSærbidrag.resultat.delberegningUtgift;
    return (
        <>
            <Heading size="xsmall">{"BPs andel"}</Heading>
            <HStack gap={"5"} className="pb-2 w-full">
                <BPsAndelInntekterTable
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
