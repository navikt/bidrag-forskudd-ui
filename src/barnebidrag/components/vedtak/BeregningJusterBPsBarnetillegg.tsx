import { BodyShort, Heading } from "@navikt/ds-react";

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
            return `Fordelt bidrag (${formatterBeløpForBeregning(foreløpigBeregnetBidrag)}) er lavere enn BPs barnetillegg (${formatterBeløpForBeregning(sluttberegning.nettoBarnetilleggBP)}). 
            Bidraget justeres derfor opp til BPs barnetillegg (${formatterBeløpForBeregning(sluttberegning.nettoBarnetilleggBP)}).`;
        } else {
            return `Fordelt bidrag (${formatterBeløpForBeregning(foreløpigBeregnetBidrag)}) er høyere enn BPs barnetillegg (${formatterBeløpForBeregning(sluttberegning.nettoBarnetilleggBP)}). 
            Bidraget justeres derfor ikke`;
        }
    }
    return (
        <div>
            <Heading size="xsmall">Juster opp til netto barnetillegg til BP</Heading>

            <BodyShort size="small">{renderResult()}</BodyShort>
        </div>
    );
};
