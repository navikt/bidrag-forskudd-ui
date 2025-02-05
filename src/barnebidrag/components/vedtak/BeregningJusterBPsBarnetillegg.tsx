import { ResultatDescription } from "../../../common/components/vedtak/ResultatDescription";
import { formatterBeløpForBeregning } from "../../../utils/number-utils";
import { useBidragBeregningPeriode } from "./DetaljertBeregningBidrag";

export const BeregningJusterBPsBarnetillegg = () => {
    const {
        beregningsdetaljer: { sluttberegning },
    } = useBidragBeregningPeriode();

    function renderResult() {
        if (sluttberegning.bidragJustertForNettoBarnetilleggBP) {
            return ` (justert opp til BPs netto barnetillegg)`;
        }
        return "";
    }

    function hentForeløpigBidrag() {
        if (sluttberegning.bidragJustertForNettoBarnetilleggBP) {
            return formatterBeløpForBeregning(sluttberegning.bruttoBidragEtterBarnetilleggBP);
        } else if (sluttberegning.begrensetRevurderingUtført) {
            return formatterBeløpForBeregning(sluttberegning.bruttoBidragEtterBegrensetRevurdering);
        }
        return formatterBeløpForBeregning(sluttberegning.bruttoBidragJustertForEvneOg25Prosent);
    }
    return (
        <div>
            <ResultatDescription
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
