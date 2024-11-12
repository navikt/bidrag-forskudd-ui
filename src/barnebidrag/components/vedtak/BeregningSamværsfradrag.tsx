import { ResultatTable } from "../../../common/components/vedtak/ResultatTable";
import { hentVisningsnavn } from "../../../common/hooks/useVisningsnavn";
import { formatterBeløpForBeregning } from "../../../utils/number-utils";
import { useBidragBeregningPeriode } from "./DetaljertBeregningBidrag";

export default function BeregningSamværsfradrag() {
    const {
        beregningsdetaljer: { samværsfradrag: beregning },
    } = useBidragBeregningPeriode();

    return (
        <ResultatTable
            title="Samværsfradrag"
            data={[
                {
                    label: "Samværsklasse",
                    textRight: false,
                    value: `Samværsklasse ${hentVisningsnavn(beregning.samværsklasse)} (samvær per måned: ${beregning.gjennomsnittligSamværPerMåned})`,
                },
                {
                    label: "Samværsfradrag",
                    textRight: false,
                    value: formatterBeløpForBeregning(beregning.samværsfradrag),
                },
            ].filter((d) => d)}
        />
    );
}
