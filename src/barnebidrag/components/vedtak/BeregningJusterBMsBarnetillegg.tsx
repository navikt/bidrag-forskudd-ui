import { ResultatTable } from "../../../common/components/vedtak/ResultatTable";
import { formatterBeløpForBeregning } from "../../../utils/number-utils";
import { useBidragBeregningPeriode } from "./DetaljertBeregningBidrag";

// eslint-disable-next-line no-empty-pattern
export const BeregningJusterBMsBarnetillegg = () => {
    const {
        beregningsdetaljer: {
            sluttberegning,
            delberegningUnderholdskostnad: underholdskostnad,
            underholdskostnadMinusBMsNettoBarnetillegg: uMinusBMsNettoBarnetillegg,
            beløpEtterVurderingAv25ProsentInntektOgEvne,
        },
    } = useBidragBeregningPeriode();

    function renderResult() {
        if (sluttberegning.justertForNettoBarnetilleggBM) {
            return ` (redusert ned til U - BMs netto barnetillegg)`;
        }
        return "";
    }
    function hentForeløpigBidrag() {
        if (sluttberegning.justertForNettoBarnetilleggBM) return formatterBeløpForBeregning(uMinusBMsNettoBarnetillegg);
        return formatterBeløpForBeregning(beløpEtterVurderingAv25ProsentInntektOgEvne);
    }
    return (
        <ResultatTable
            data={[
                {
                    label: "U - BMs netto barnetillegg",
                    textRight: false,
                    labelBold: true,
                    value: `${formatterBeløpForBeregning(underholdskostnad.underholdskostnad)} - ${formatterBeløpForBeregning(sluttberegning.nettoBarnetilleggBM)} = ${formatterBeløpForBeregning(uMinusBMsNettoBarnetillegg)}`,
                },
                {
                    label: "Foreløpig bidrag",
                    textRight: false,
                    labelBold: true,
                    value: `${hentForeløpigBidrag()}${renderResult()}`,
                },
            ].filter((d) => d)}
        />
    );
};
