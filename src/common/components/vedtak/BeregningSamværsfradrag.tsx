import { BidragPeriodeBeregningsdetaljer } from "../../../api/BidragBehandlingApiV1";
import { formatterBeløpForBeregning } from "../../../utils/number-utils";
import { hentVisningsnavn } from "../../hooks/useVisningsnavn";
import { ResultatTable } from "./ResultatTable";

type BeregningSamværsfradragProps = {
    beregningsdetaljer: BidragPeriodeBeregningsdetaljer;
};
export default function BeregningSamværsfradrag({
    beregningsdetaljer: { samværsfradrag: beregning, bpsAndel, sluttberegning, delberegningBidragsevne },
}: BeregningSamværsfradragProps) {
    const beløpSomSamværsfradragTrekkesFra = sluttberegning.justertNedTil25ProsentAvInntekt
        ? delberegningBidragsevne.sumInntekt25Prosent
        : sluttberegning.justertForNettoBarnetilleggBP
          ? sluttberegning.nettoBarnetilleggBP
          : bpsAndel.andelBeløp;
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
                {
                    label: "Endelig bidrag (etter samværsfradrag)",
                    textRight: false,
                    value: `${formatterBeløpForBeregning(beløpSomSamværsfradragTrekkesFra)} - ${formatterBeløpForBeregning(beregning.samværsfradrag)} = ${formatterBeløpForBeregning(sluttberegning.beregnetBeløp)}`,
                },
            ].filter((d) => d)}
        />
    );
}
