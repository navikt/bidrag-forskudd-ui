import { VStack } from "@navikt/ds-react";
import { createContext, useContext } from "react";

import {
    BidragPeriodeBeregningsdetaljer,
    ResultatBarnebidragsberegningPeriodeDto,
    Rolletype,
} from "../../../api/BidragBehandlingApiV1";
import { BPsEvneV2 } from "../../../common/components/vedtak/BPsEvneTabell";
import { BeregningFordeltBidrag } from "./BeregningFordeltBidrag";
import { BeregningJusterBMsBarnetillegg } from "./BeregningJusterBMsBarnetillegg";
import { BeregningJusterBPsBarnetillegg } from "./BeregningJusterBPsBarnetillegg";
import BeregningSamværsfradrag from "./BeregningSamværsfradrag";
import { BPsAndelUnderholdskostnad } from "./BPsAndelUnderholdstkostnad";
import { EndeligBidragTable } from "./EndeligBidragTable";
import { NettoBarnetilleggTable } from "./NettoBarnetilleggTable";

type DetaljertBeregningBidragProps = {
    periode: ResultatBarnebidragsberegningPeriodeDto;
};

type BidragBeregningContextProps = {
    beregningsdetaljer: BidragPeriodeBeregningsdetaljer;
};
export const BidragBeregningContext = createContext<BidragBeregningContextProps | null>(null);
export const useBidragBeregningPeriode = () => {
    const context = useContext(BidragBeregningContext);
    if (context === null) {
        throw new Error("useBidragBeregningPeriode must be used within a BidragBeregningContext");
    }
    return context;
};

export const DetaljertBeregningBidrag: React.FC<DetaljertBeregningBidragProps> = ({ periode }) => {
    const beregningsdetaljer = periode.beregningsdetaljer as BidragPeriodeBeregningsdetaljer;
    return (
        <VStack gap="2" className={"w-[800px]"}>
            <BidragBeregningContext.Provider value={{ beregningsdetaljer }}>
                <BPsAndelUnderholdskostnad />
                <BPsEvneV2
                    inntekter={beregningsdetaljer.inntekter}
                    bidragsevne={beregningsdetaljer.delberegningBidragsevne}
                />
                <BeregningFordeltBidrag />
                <NettoBarnetilleggTable rolle={Rolletype.BM} />
                <BeregningJusterBMsBarnetillegg />
                <NettoBarnetilleggTable rolle={Rolletype.BP} />
                <BeregningJusterBPsBarnetillegg />
                <BeregningSamværsfradrag />
                <EndeligBidragTable />
            </BidragBeregningContext.Provider>
        </VStack>
    );
};
