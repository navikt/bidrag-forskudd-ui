import { ResultatDescription } from "../../../common/components/vedtak/ResultatDescription";
import { hentVisningsnavn } from "../../../common/hooks/useVisningsnavn";
import { formatterBeløpForBeregning } from "../../../utils/number-utils";
import { useBidragBeregningPeriode } from "./DetaljertBeregningBidrag";

export default function BeregningSamværsfradrag() {
    const {
        beregningsdetaljer: { samværsfradrag: beregning },
    } = useBidragBeregningPeriode();

    return (
        <ResultatDescription
            title="Samværsfradrag"
            data={[
                {
                    label: "Samværsklasse",
                    textRight: false,
                    labelBold: true,
                    value: `Samværsklasse ${hentVisningsnavn(beregning.samværsklasse)} (samvær per måned: ${beregning.gjennomsnittligSamværPerMåned})`,
                },
                {
                    label: "Samværsfradrag",
                    textRight: false,
                    labelBold: true,
                    value: formatterBeløpForBeregning(beregning.samværsfradrag),
                },
            ].filter((d) => d)}
        />
    );
}
