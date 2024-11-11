import { VStack } from "@navikt/ds-react";

import {
    BidragPeriodeBeregningsdetaljer,
    ResultatBarnebidragsberegningPeriodeDto,
    Rolletype,
} from "../../../api/BidragBehandlingApiV1";
import BeregningSamværsfradrag from "../../../common/components/vedtak/BeregningSamværsfradrag";
import { BPsAndelUnderholdskostnad } from "../../../common/components/vedtak/BPAndelTable";
import { BPsEvneV2 } from "../../../common/components/vedtak/BPsEvneTabell";
import { BeregningFordeltBidrag } from "./BeregningFordeltBidrag";
import { BeregningJusterBPsBarnetillegg } from "./BeregningJusterBPsBarnetillegg";
import { EndeligBidragTable } from "./EndeligBidragTable";
import { NettoBarnetilleggTable } from "./NettoBarnetilleggTable";

type DetaljertBeregningBidragProps = {
    periode: ResultatBarnebidragsberegningPeriodeDto;
};
export const DetaljertBeregningBidrag: React.FC<DetaljertBeregningBidragProps> = ({ periode }) => {
    const beregningsdetaljer = periode.beregningsdetaljer as BidragPeriodeBeregningsdetaljer;
    return (
        <VStack gap="4" className={"w-[800px]"}>
            <BPsAndelUnderholdskostnad beregningsdetaljer={beregningsdetaljer} />
            <BPsEvneV2
                inntekter={beregningsdetaljer.inntekter}
                bidragsevne={beregningsdetaljer.delberegningBidragsevne}
            />
            <NettoBarnetilleggTable rolle={Rolletype.BP} beregningsdetaljer={periode.beregningsdetaljer} />
            <BeregningFordeltBidrag beregningsdetaljer={periode.beregningsdetaljer} />
            <BeregningJusterBPsBarnetillegg beregningsdetaljer={periode.beregningsdetaljer} />
            <BeregningSamværsfradrag beregningsdetaljer={periode.beregningsdetaljer} />
            <NettoBarnetilleggTable rolle={Rolletype.BM} beregningsdetaljer={periode.beregningsdetaljer} />
            <EndeligBidragTable
                sluttberegning={periode.beregningsdetaljer.sluttberegning}
                underholdskostnad={periode.beregningsdetaljer.delberegningUnderholdskostnad}
            />
        </VStack>
    );
};
