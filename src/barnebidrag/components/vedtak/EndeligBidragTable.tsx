import { ResultatTable } from "../../../common/components/vedtak/ResultatTable";
import { formatterBeløpForBeregning } from "../../../utils/number-utils";
import { useBidragBeregningPeriode } from "./DetaljertBeregningBidrag";

// eslint-disable-next-line no-empty-pattern
export const EndeligBidragTable = () => {
    const {
        beregningsdetaljer: { sluttberegning, samværsfradrag: beregning, beløpSamværsfradragTrekkesFra },
    } = useBidragBeregningPeriode();

    return (
        <ResultatTable
            title="Endelig bidrag"
            data={[
                {
                    label: "Etter samværsfradraget",
                    textRight: false,
                    labelBold: true,
                    value: `${formatterBeløpForBeregning(beløpSamværsfradragTrekkesFra)} - ${formatterBeløpForBeregning(beregning.samværsfradrag)} = ${formatterBeløpForBeregning(sluttberegning.beregnetBeløp)}`,
                },
                {
                    label: "Avrundet beløp",
                    textRight: false,
                    labelBold: true,
                    value: `${formatterBeløpForBeregning(sluttberegning.resultatBeløp)}`,
                },
            ].filter((d) => d)}
        />
    );
};
