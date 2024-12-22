import { BodyShort, VStack } from "@navikt/ds-react";

import { BPsAndelInntekterTable } from "../../../common/components/vedtak/BPsAndelInntekterTable";
import { ResultatDescription } from "../../../common/components/vedtak/ResultatDescription";
import { formatterBeløpForBeregning, formatterProsent } from "../../../utils/number-utils";
import { useBidragBeregningPeriode } from "./DetaljertBeregningBidrag";

export const BPsAndelUnderholdskostnad = () => {
    const { beregningsdetaljer } = useBidragBeregningPeriode();
    const bpsAndel = beregningsdetaljer.bpsAndel;
    const inntekter = beregningsdetaljer.inntekter;
    const delberegningUnderholdskostnad = beregningsdetaljer.delberegningUnderholdskostnad;
    return (
        <VStack gap="2">
            <BPsAndelInntekterTable inntekter={inntekter} forskuddssats={beregningsdetaljer.forskuddssats} />
            <ResultatDescription
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
        </VStack>
    );
};
