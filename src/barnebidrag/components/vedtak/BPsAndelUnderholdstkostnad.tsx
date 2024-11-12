import { BodyShort, Heading } from "@navikt/ds-react";

import {
    DelberegningBidragspliktigesAndel,
    ResultatSaerbidragsberegningInntekterDto,
} from "../../../api/BidragBehandlingApiV1";
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
        <>
            <Heading size="xsmall">{"BPs andel"}</Heading>
            <BPsAndelInntekterTableV2 inntekter={inntekter} forskuddssats={beregningsdetaljer.forskuddssats} />
            <div>
                <ResultatTable
                    data={[
                        generateBpsAndelSection(inntekter, bpsAndel),
                        {
                            label: "Andel underholdskostnad",
                            textRight: false,
                            value: `${formatterBeløpForBeregning(delberegningUnderholdskostnad.underholdskostnad, true)} x ${formatterProsent(bpsAndel.endeligAndelFaktor)} = ${formatterBeløpForBeregning(bpsAndel.andelBeløp, true)}`,
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
const generateBpsAndelSection = (
    inntekter: ResultatSaerbidragsberegningInntekterDto,
    bpsAndel: DelberegningBidragspliktigesAndel
) => ({
    label: "BP's andel av underholdskostnad (i prosent)",
    textRight: false,
    value: `${formatterBeløpForBeregning(inntekter.inntektBP, true)} / ${formatterBeløpForBeregning(inntekter.totalEndeligInntekt)} = ${formatterProsent(bpsAndel.beregnetAndelFaktor)}`,
});
