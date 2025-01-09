import { ResultatDescription } from "../../../common/components/vedtak/ResultatDescription";
import { formatterBeløpForBeregning } from "../../../utils/number-utils";
import { useBidragBeregningPeriode } from "./DetaljertBeregningBidrag";

export const BeregningFordeltBidrag = () => {
    const {
        beregningsdetaljer: { sluttberegning, delberegningBidragsevne: evne },
    } = useBidragBeregningPeriode();

    function renderResult() {
        if (sluttberegning.bidragJustertNedTilEvne) {
            return ` (redusert ned til evne)`;
        } else if (sluttberegning.bidragJustertNedTil25ProsentAvInntekt) {
            return ` (redusert ned til 25% av inntekt)`;
        }
        return "";
    }

    return (
        <ResultatDescription
            data={[
                {
                    label: "25% av inntekt",
                    textRight: false,
                    labelBold: true,
                    value: formatterBeløpForBeregning(evne.sumInntekt25Prosent),
                },
                {
                    label: "Foreløpig bidrag",
                    textRight: false,
                    labelBold: true,
                    value: `${formatterBeløpForBeregning(sluttberegning.bruttoBidragJustertForEvneOg25Prosent)}${renderResult()}`,
                },
            ].filter((d) => d)}
        />
    );
};
