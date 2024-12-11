import { VStack } from "@navikt/ds-react";
import { createContext, useContext } from "react";

import {
    BidragPeriodeBeregningsdetaljer,
    ResultatBarnebidragsberegningPeriodeDto,
    Rolletype,
} from "../../../api/BidragBehandlingApiV1";
import { BPsEvneV2 } from "../../../common/components/vedtak/BPsEvneTabell";
import { EndeligBidragTable } from "./BeregningEndeligBidrag";
import { BeregningFordeltBidrag } from "./BeregningFordeltBidrag";
import { BeregningJusterBMsBarnetillegg } from "./BeregningJusterBMsBarnetillegg";
import { BeregningJusterBPsBarnetillegg } from "./BeregningJusterBPsBarnetillegg";
import BeregningSamværsfradrag from "./BeregningSamværsfradrag";
import { BPsAndelUnderholdskostnad } from "./BPsAndelUnderholdstkostnad";
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
    if (beregningsdetaljer.sluttberegning.barnetErSelvforsørget) return null;
    return (
        <VStack gap="6" className={"w-[800px]"}>
            <BidragBeregningContext.Provider value={{ beregningsdetaljer }}>
                <BPsAndelUnderholdskostnad />
                {!beregningsdetaljer.deltBosted && <BeregningSamværsfradrag />}
                {!beregningsdetaljer.deltBosted && beregningsdetaljer.barnetilleggBM.barnetillegg.length > 0 && (
                    <VStack gap="2">
                        <NettoBarnetilleggTable rolle={Rolletype.BM} />
                        <BeregningJusterBMsBarnetillegg />
                    </VStack>
                )}
                <VStack gap="2">
                    <BPsEvneV2
                        inntekter={beregningsdetaljer.inntekter}
                        bidragsevne={beregningsdetaljer.delberegningBidragsevne}
                    />
                    <BeregningFordeltBidrag />
                </VStack>
                {!beregningsdetaljer.deltBosted && beregningsdetaljer.barnetilleggBP.barnetillegg.length > 0 && (
                    <VStack gap="2">
                        <NettoBarnetilleggTable rolle={Rolletype.BP} />
                        <BeregningJusterBPsBarnetillegg />
                    </VStack>
                )}
                <EndeligBidragTable />
            </BidragBeregningContext.Provider>
        </VStack>
    );
};
