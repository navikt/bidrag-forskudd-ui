import { ResultatTable } from "../../../common/components/vedtak/ResultatTable";
import { formatterBeløpForBeregning } from "../../../utils/number-utils";
import { useBidragBeregningPeriode } from "./DetaljertBeregningBidrag";

// eslint-disable-next-line no-empty-pattern
export const EndeligBidragTable = () => {
    const {
        beregningsdetaljer: {
            sluttberegning,
            delberegningBidragsevne,
            bpsAndel,
            samværsfradrag: beregning,
            delberegningUnderholdskostnad: underholdskostnad,
        },
    } = useBidragBeregningPeriode();

    const beløpSomSamværsfradragTrekkesFra = () => {
        if (sluttberegning.justertForNettoBarnetilleggBM)
            return Math.max(underholdskostnad.underholdskostnad - sluttberegning.nettoBarnetilleggBM, 0);
        if (sluttberegning.justertForNettoBarnetilleggBP) return sluttberegning.nettoBarnetilleggBP;
        if (sluttberegning.justertNedTil25ProsentAvInntekt) return delberegningBidragsevne.sumInntekt25Prosent;
        if (sluttberegning.justertNedTilEvne) return delberegningBidragsevne.bidragsevne;
        return bpsAndel.andelBeløp;
    };
    return (
        <ResultatTable
            title="Endelig bidrag"
            data={[
                {
                    label: "Etter samværsfradraget",
                    textRight: false,
                    labelBold: true,
                    value: `${formatterBeløpForBeregning(beløpSomSamværsfradragTrekkesFra())} - ${formatterBeløpForBeregning(beregning.samværsfradrag)} = ${formatterBeløpForBeregning(sluttberegning.beregnetBeløp)}`,
                },
                {
                    label: "Avrundet beløp",
                    textRight: false,
                    labelBold: true,
                    value: `${formatterBeløpForBeregning(sluttberegning.resultatBeløp)}`,
                },
            ].filter((d) => d)}
        />
    );
};
