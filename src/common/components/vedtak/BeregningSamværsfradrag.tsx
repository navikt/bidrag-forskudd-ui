import {
    BeregningsdetaljerSamvaersfradrag,
    DelberegningBidragspliktigesAndel,
} from "../../../api/BidragBehandlingApiV1";
import { formatterBeløpForBeregning } from "../../../utils/number-utils";
import { hentVisningsnavn } from "../../hooks/useVisningsnavn";
import { ResultatTable } from "./ResultatTable";

type BeregningSamværsfradragProps = {
    beregning: BeregningsdetaljerSamvaersfradrag;
    bpsAndel: DelberegningBidragspliktigesAndel;
    beregnetBidrag: number;
};
export default function BeregningSamværsfradrag({ beregning, bpsAndel, beregnetBidrag }: BeregningSamværsfradragProps) {
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
                    value: `${formatterBeløpForBeregning(bpsAndel.andelBeløp)} - ${formatterBeløpForBeregning(beregning.samværsfradrag)} = ${beregnetBidrag}`,
                },
            ].filter((d) => d)}
        />
    );
}
