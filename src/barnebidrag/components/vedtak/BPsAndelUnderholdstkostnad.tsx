import { BodyShort, Heading, VStack } from "@navikt/ds-react";

import { BPsAndelInntekterTableV2 } from "../../../common/components/vedtak/BPsAndelInntekterTable";
import { ResultatTable } from "../../../common/components/vedtak/ResultatTable";
import { formatterBeløpForBeregning, formatterProsent } from "../../../utils/number-utils";
import { useBidragBeregningPeriode } from "./DetaljertBeregningBidrag";

export const BPsAndelUnderholdskostnad = () => {
    const { beregningsdetaljer } = useBidragBeregningPeriode();
    const bpsAndel = beregningsdetaljer.bpsAndel;
    const inntekter = beregningsdetaljer.inntekter;
    const delberegningUnderholdskostnad = beregningsdetaljer.delberegningUnderholdskostnad;
    return (
        <div>
            <Heading size="xsmall">{"BPs andel"}</Heading>
            <VStack gap="2">
                <BPsAndelInntekterTableV2 inntekter={inntekter} forskuddssats={beregningsdetaljer.forskuddssats} />
                <div>
                    <ResultatTable
                        data={[
                            {
                                label: "BP's andel av underholdskostnad (i prosent)",
                                textRight: false,
                                labelBold: true,
                                value: `${formatterBeløpForBeregning(inntekter.inntektBP, true)} / ${formatterBeløpForBeregning(inntekter.totalEndeligInntekt)} = ${formatterProsent(bpsAndel.beregnetAndelFaktor)}`,
                            },
                            {
                                label: "Andel underholdskostnad",
                                textRight: false,
                                labelBold: true,
                                value: `${formatterBeløpForBeregning(delberegningUnderholdskostnad.underholdskostnad, true)} x ${formatterProsent(bpsAndel.endeligAndelFaktor)} = ${formatterBeløpForBeregning(bpsAndel.andelBeløp, true)}`,
                            },
                            beregningsdetaljer.deltBosted && {
                                label: "Etter fratrekk delt bosted",
                                textRight: false,
                                labelBold: true,
                                value: `${formatterBeløpForBeregning(bpsAndel.andelBeløp, true)} - ${formatterBeløpForBeregning(delberegningUnderholdskostnad.underholdskostnad, true)} x ${formatterProsent(0.5)} = ${formatterBeløpForBeregning(beregningsdetaljer.sluttberegning.bpAndelAvUVedDeltBostedBeløp, true)}`,
                            },
                        ].filter((d) => d)}
                    />
                    {bpsAndel.endeligAndelFaktor !== bpsAndel.beregnetAndelFaktor && (
                        <BodyShort size="small" weight="semibold" spacing className="text-red-500 pl-[3px]">
                            Andel begrenset til {formatterProsent(bpsAndel.endeligAndelFaktor)}
                        </BodyShort>
                    )}
                </div>
            </VStack>
        </div>
    );
};
