import { BodyShort, Heading } from "@navikt/ds-react";

import { BidragPeriodeBeregningsdetaljer } from "../../../api/BidragBehandlingApiV1";
import { formatterBeløpForBeregning } from "../../../utils/number-utils";

type BeregningJusterBPsBarnetilleggProps = {
    beregningsdetaljer: BidragPeriodeBeregningsdetaljer;
};
// eslint-disable-next-line no-empty-pattern
export const BeregningJusterBPsBarnetillegg = ({
    beregningsdetaljer: { sluttberegning },
}: BeregningJusterBPsBarnetilleggProps) => {
    function renderResult() {
        if (sluttberegning.justertForNettoBarnetilleggBP) {
            return `Fordelt bidrag (${formatterBeløpForBeregning(sluttberegning.beregnetBeløp)}) er lavere enn BPs barnetillegg (${formatterBeløpForBeregning(sluttberegning.nettoBarnetilleggBP)}). 
            Bidraget justeres derfor opp til BPs barnetillegg (${formatterBeløpForBeregning(sluttberegning.nettoBarnetilleggBP)}).`;
        } else {
            return `Fordelt bidrag (${formatterBeløpForBeregning(sluttberegning.beregnetBeløp)}) er høyere enn BPs barnetillegg (${formatterBeløpForBeregning(sluttberegning.nettoBarnetilleggBP)}). 
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
