import { BodyShort, Heading } from "@navikt/ds-react";

import { BidragPeriodeBeregningsdetaljer } from "../../../api/BidragBehandlingApiV1";
import { formatterBeløpForBeregning } from "../../../utils/number-utils";

type BeregningFordeltBidragProps = {
    beregningsdetaljer: BidragPeriodeBeregningsdetaljer;
};
// eslint-disable-next-line no-empty-pattern
export const BeregningFordeltBidrag = ({
    beregningsdetaljer: { sluttberegning, delberegningBidragsevne: evne },
}: BeregningFordeltBidragProps) => {
    function renderResult() {
        if (sluttberegning.justertNedTilEvne) {
            return `BPs totale bidrag (${formatterBeløpForBeregning(sluttberegning.kostnadsberegnetBidrag)}) er høyere enn evne (${formatterBeløpForBeregning(evne.bidragsevne)}) 
            men lavere enn 25% av inntekt (${formatterBeløpForBeregning(evne.sumInntekt25Prosent)}). Bidraget reduseres derfor til evne (${formatterBeløpForBeregning(evne.bidragsevne)})`;
        } else if (sluttberegning.justertNedTil25ProsentAvInntekt) {
            return `BPs totale bidrag (${formatterBeløpForBeregning(sluttberegning.kostnadsberegnetBidrag)}) er lavere enn evne (${formatterBeløpForBeregning(evne.bidragsevne)}) 
            men høyere enn 25% av inntekt (${formatterBeløpForBeregning(evne.sumInntekt25Prosent)}). Bidraget reduseres derfor til evne $(${formatterBeløpForBeregning(evne.sumInntekt25Prosent)})`;
        } else {
            return `BPs totale bidrag (${formatterBeløpForBeregning(sluttberegning.kostnadsberegnetBidrag)}) er lavere enn både evne (${formatterBeløpForBeregning(evne.bidragsevne)}) 
            og 25% av inntekt (${formatterBeløpForBeregning(evne.sumInntekt25Prosent)}). Bidraget (${formatterBeløpForBeregning(sluttberegning.kostnadsberegnetBidrag)}) reduseres derfor ikke`;
        }
    }
    return (
        <div>
            <Heading size="xsmall">Fordelt bidrag</Heading>

            <BodyShort size="small">{renderResult()}</BodyShort>
        </div>
    );
};
