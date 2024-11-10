import { VStack } from "@navikt/ds-react";

import {
    BidragPeriodeBeregningsdetaljer,
    ResultatBarnebidragsberegningPeriodeDto,
} from "../../../api/BidragBehandlingApiV1";
import BeregningSamværsfradrag from "../../../common/components/vedtak/BeregningSamværsfradrag";
import { BPsAndelUnderholdskostnad } from "../../../common/components/vedtak/BPAndelTable";
import { BPsEvne } from "../../../common/components/vedtak/BPsEvneTabell";
import { NettoBarnetilleggTable } from "../../../common/components/vedtak/NettoBarnetilleggTable";

type DetaljertBeregningBidragProps = {
    periode: ResultatBarnebidragsberegningPeriodeDto;
};
export const DetaljertBeregningBidrag: React.FC<DetaljertBeregningBidragProps> = ({ periode }) => {
    const beregningsdetaljer = periode.beregningsdetaljer as BidragPeriodeBeregningsdetaljer;
    return (
        <VStack gap="2">
            <BPsAndelUnderholdskostnad beregningsdetaljer={beregningsdetaljer} />
            <BPsEvne
                inntekter={beregningsdetaljer.inntekter}
                bidragsevne={beregningsdetaljer.delberegningBidragsevne}
            />
            <BeregningSamværsfradrag
                beregning={beregningsdetaljer.samværsfradrag}
                bpsAndel={beregningsdetaljer.bpsAndel}
                beregnetBidrag={periode.beregnetBidrag}
            />
            <NettoBarnetilleggTable />
        </VStack>
    );
};
