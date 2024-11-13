import { BodyShort } from "@navikt/ds-react";

import {
    DelberegningBidragspliktigesAndel,
    ResultatSaerbidragsberegningInntekterDto,
} from "../../../api/BidragBehandlingApiV1";
import { formatterBeløpForBeregning } from "../../../utils/number-utils";
import { CalculationTabell, CalculationTabellV2, MathMultiplication, MathValue } from "./CalculationTable";

type BPsAndelProps = {
    inntekter: ResultatSaerbidragsberegningInntekterDto;
    bpsAndel: DelberegningBidragspliktigesAndel;
    forskuddssats: number;
};

export const BPsAndelInntekterTable = ({
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

export const BPsAndelInntekterTableV2 = ({
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
                                    {formatterBeløpForBeregning(inntekter.inntektBarn)} - 30 x{" "}
                                    {formatterBeløpForBeregning(forskuddssats)}
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
