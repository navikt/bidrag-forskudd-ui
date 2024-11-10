import { BodyShort, Heading, HStack } from "@navikt/ds-react";

import {
    BidragPeriodeBeregningsdetaljer,
    DelberegningBidragspliktigesAndel,
    ResultatSaerbidragsberegningInntekterDto,
} from "../../../api/BidragBehandlingApiV1";
import { formatterBeløpForBeregning, formatterProsent } from "../../../utils/number-utils";
import { useGetBeregningSærbidrag } from "../../hooks/useApiData";
import { CalculationTabell, MathMultiplication, MathValue } from "./CalculationTable";

export const BPsAndelUtgifter = () => {
    const { data: beregnetSærbidrag } = useGetBeregningSærbidrag();

    const delberegningBpsAndel = beregnetSærbidrag.resultat.bpsAndel;
    const inntekter = beregnetSærbidrag.resultat.inntekter;
    const utgifter = beregnetSærbidrag.resultat.delberegningUtgift;
    return (
        <div>
            <BPsAndel
                inntekter={inntekter}
                bpsAndel={delberegningBpsAndel}
                forskuddssats={beregnetSærbidrag.resultat.forskuddssats}
            />

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
type DetaljertBeregningBidragProps = {
    beregningsdetaljer: BidragPeriodeBeregningsdetaljer;
};
export const BPsAndelUnderholdskostnad = ({ beregningsdetaljer }: DetaljertBeregningBidragProps) => {
    const delberegningBpsAndel = beregningsdetaljer.bpsAndel;
    const inntekter = beregningsdetaljer.inntekter;
    const delberegningUnderholdskostnad = beregningsdetaljer.delberegningUnderholdskostnad;
    return (
        <div>
            <BPsAndel
                inntekter={inntekter}
                bpsAndel={delberegningBpsAndel}
                forskuddssats={beregningsdetaljer.forskuddssats}
            />

            <div>
                Andel underholdskostnad:{" "}
                <MathMultiplication
                    left={`${formatterBeløpForBeregning(delberegningUnderholdskostnad.beløp, true)}`}
                    right={formatterProsent(delberegningBpsAndel.endeligAndelFaktor)}
                />{" "}
                = {formatterBeløpForBeregning(delberegningBpsAndel.andelBeløp, true)}
            </div>
        </div>
    );
};
type BPsAndelProps = {
    inntekter: ResultatSaerbidragsberegningInntekterDto;
    bpsAndel: DelberegningBidragspliktigesAndel;
    forskuddssats: number;
};
const BPsAndel = ({ inntekter, bpsAndel, forskuddssats }: BPsAndelProps) => {
    return (
        <>
            <Heading size="xsmall">{"BPs andel"}</Heading>
            <HStack gap={"5"} className="pb-2 w-full">
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
        </>
    );
};
