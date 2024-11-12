import { ResultatTable } from "../../../common/components/vedtak/ResultatTable";
import { hentVisningsnavn } from "../../../common/hooks/useVisningsnavn";
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
                    value: beregning.samværsfradrag,
                },
                // {
                //     label: "Endelig bidrag (etter samværsfradrag)",
                //     textRight: false,
                //     value: `${formatterBeløpForBeregning(beløpSomSamværsfradragTrekkesFra)} - ${formatterBeløpForBeregning(beregning.samværsfradrag)} = ${formatterBeløpForBeregning(sluttberegning.beregnetBeløp)}`,
                // },
            ].filter((d) => d)}
        />
    );
}
