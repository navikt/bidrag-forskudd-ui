import { ResultatTable } from "../../../common/components/vedtak/ResultatTable";
import { formatterBeløpForBeregning } from "../../../utils/number-utils";
import { useBidragBeregningPeriode } from "./DetaljertBeregningBidrag";

// eslint-disable-next-line no-empty-pattern
export const BeregningJusterBPsBarnetillegg = () => {
    const {
        beregningsdetaljer: { sluttberegning, delberegningUnderholdskostnad: underholdskostnad },
    } = useBidragBeregningPeriode();
    const uMinusBMsNettoBarnetillegg = Math.max(
        underholdskostnad.underholdskostnad - sluttberegning.nettoBarnetilleggBM,
        0
    );
    const foreløpigBeregnetBidrag = sluttberegning.justertForNettoBarnetilleggBM
        ? uMinusBMsNettoBarnetillegg
        : sluttberegning.kostnadsberegnetBidrag;

    function renderResult() {
        if (sluttberegning.justertForNettoBarnetilleggBP) {
            return ` (justert opp til BPs netto barnetillegg)`;
        }
        return "";
    }
    function hentForeløpigBidrag() {
        if (sluttberegning.justertForNettoBarnetilleggBP)
            return formatterBeløpForBeregning(sluttberegning.nettoBarnetilleggBP);
        return formatterBeløpForBeregning(foreløpigBeregnetBidrag);
    }
    return (
        <div>
            <ResultatTable
                data={[
                    {
                        label: "Foreløpig bidrag",
                        textRight: false,
                        labelStrong: true,
                        value: `${hentForeløpigBidrag()}${renderResult()}`,
                    },
                ].filter((d) => d)}
            />
        </div>
    );
};
