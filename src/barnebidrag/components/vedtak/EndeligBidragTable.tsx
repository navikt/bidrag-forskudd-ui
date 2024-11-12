import { ResultatTable } from "../../../common/components/vedtak/ResultatTable";
import { formatterBeløpForBeregning } from "../../../utils/number-utils";
import { useBidragBeregningPeriode } from "./DetaljertBeregningBidrag";

// eslint-disable-next-line no-empty-pattern
export const EndeligBidragTable = () => {
    const {
        beregningsdetaljer: { sluttberegning, delberegningBidragsevne, bpsAndel, samværsfradrag: beregning },
    } = useBidragBeregningPeriode();
    const beløpSomSamværsfradragTrekkesFra = sluttberegning.justertNedTil25ProsentAvInntekt
        ? delberegningBidragsevne.sumInntekt25Prosent
        : sluttberegning.justertForNettoBarnetilleggBP
          ? sluttberegning.nettoBarnetilleggBP
          : bpsAndel.andelBeløp;
    return (
        <ResultatTable
            title="Endelig bidrag"
            data={[
                {
                    label: "Endelig bidrag (etter samværsfradrag)",
                    textRight: false,
                    value: `${formatterBeløpForBeregning(beløpSomSamværsfradragTrekkesFra)} - ${formatterBeløpForBeregning(beregning.samværsfradrag)} = ${formatterBeløpForBeregning(sluttberegning.beregnetBeløp)}`,
                },
            ].filter((d) => d)}
        />
    );
};
