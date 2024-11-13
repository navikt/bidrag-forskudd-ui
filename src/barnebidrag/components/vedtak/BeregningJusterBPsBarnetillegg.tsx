import { ResultatTable } from "../../../common/components/vedtak/ResultatTable";
import { formatterBeløpForBeregning } from "../../../utils/number-utils";
import { useBidragBeregningPeriode } from "./DetaljertBeregningBidrag";

// eslint-disable-next-line no-empty-pattern
export const BeregningJusterBPsBarnetillegg = () => {
    const {
        beregningsdetaljer: { sluttberegning, beløpEtterVurderingAvBMsBarnetillegg },
    } = useBidragBeregningPeriode();

    function renderResult() {
        if (sluttberegning.justertForNettoBarnetilleggBP) {
            return ` (justert opp til BPs netto barnetillegg)`;
        }
        return "";
    }
    function hentForeløpigBidrag() {
        if (sluttberegning.justertForNettoBarnetilleggBP)
            return formatterBeløpForBeregning(sluttberegning.nettoBarnetilleggBP);
        return formatterBeløpForBeregning(beløpEtterVurderingAvBMsBarnetillegg);
    }
    return (
        <div>
            <ResultatTable
                data={[
                    {
                        label: "Foreløpig bidrag",
                        textRight: false,
                        labelBold: true,
                        value: `${hentForeløpigBidrag()}${renderResult()}`,
                    },
                ].filter((d) => d)}
            />
        </div>
    );
};
