import { ResultatTable } from "../../../common/components/vedtak/ResultatTable";
import { formatterBeløpForBeregning } from "../../../utils/number-utils";
import { useBidragBeregningPeriode } from "./DetaljertBeregningBidrag";

// eslint-disable-next-line no-empty-pattern
export const BeregningJusterBMsBarnetillegg = () => {
    const {
        beregningsdetaljer: { sluttberegning, delberegningUnderholdskostnad: underholdskostnad, barnetilleggBM },
    } = useBidragBeregningPeriode();

    function renderResult() {
        if (sluttberegning.bidragJustertForNettoBarnetilleggBM) {
            return ` (justert til U - BMs netto barnetillegg + samværsfradrag)`;
        }
        return "";
    }
    if (barnetilleggBM.barnetillegg.length === 0) return null;

    return (
        <ResultatTable
            data={[
                {
                    label: "U - BMs netto barnetillegg",
                    textRight: false,
                    labelBold: true,
                    value: `${formatterBeløpForBeregning(underholdskostnad.underholdskostnad)} - ${formatterBeløpForBeregning(barnetilleggBM.sumNettoBeløp)} = ${formatterBeløpForBeregning(sluttberegning.uminusNettoBarnetilleggBM)}`,
                },
                {
                    label: "Foreløpig bidrag",
                    textRight: false,
                    labelBold: true,
                    value: `${formatterBeløpForBeregning(sluttberegning.bruttoBidragEtterBarnetilleggBM)}${renderResult()}`,
                },
            ].filter((d) => d)}
        />
    );
};
