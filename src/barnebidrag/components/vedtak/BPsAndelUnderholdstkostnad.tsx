import { BodyShort, Heading } from "@navikt/ds-react";

import {
    BidragPeriodeBeregningsdetaljer,
    DelberegningBidragspliktigesAndel,
    ResultatSaerbidragsberegningInntekterDto,
} from "../../../api/BidragBehandlingApiV1";
import { BPsAndelInntekterTableV2 } from "../../../common/components/vedtak/BPsAndelInntekterTable";
import { MathDivision, MathMultiplication, MathValue } from "../../../common/components/vedtak/CalculationTable";
import { ResultatTable } from "../../../common/components/vedtak/ResultatTable";
import { formatterBeløpForBeregning, formatterProsent } from "../../../utils/number-utils";

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
            <BPsAndelInntekterTableV2 inntekter={inntekter} forskuddssats={beregningsdetaljer.forskuddssats} />
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
