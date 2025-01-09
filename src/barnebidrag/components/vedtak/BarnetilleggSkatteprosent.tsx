import { Heading } from "@navikt/ds-react";

import { Rolletype } from "../../../api/BidragBehandlingApiV1";
import { CalculationTabell } from "../../../common/components/vedtak/CalculationTable";
import { ResultatDescription } from "../../../common/components/vedtak/ResultatDescription";
import { ROLE_FORKORTELSER } from "../../../common/constants/roleTags";
import { formatterBeløpForBeregning, formatterProsent } from "../../../utils/number-utils";
import { useBidragBeregningPeriode } from "./DetaljertBeregningBidrag";

type NettoBarnetilleggTableProps = {
    rolle: Rolletype;
};

export const BarnetilleggSkatteprosent = ({ rolle }: NettoBarnetilleggTableProps) => {
    const { beregningsdetaljer } = useBidragBeregningPeriode();
    const barnetillegg = rolle === Rolletype.BP ? beregningsdetaljer.barnetilleggBP : beregningsdetaljer.barnetilleggBM;
    const barnetilleggSkattesats = barnetillegg.delberegningSkattesats;
    if (!barnetilleggSkattesats) return null;
    return (
        <div>
            <Heading size="xsmall">Beregning av skatteprosent på barnetillegg ({ROLE_FORKORTELSER[rolle]})</Heading>

            <CalculationTabell
                data={[
                    {
                        label: "Skatt",
                        result: formatterBeløpForBeregning(barnetilleggSkattesats.skattAlminneligInntekt, true),
                    },
                    {
                        label: "Trygdeavgift",
                        result: formatterBeløpForBeregning(barnetilleggSkattesats.trygdeavgift, true),
                    },
                    {
                        label: "Trinnskatt",
                        result: formatterBeløpForBeregning(barnetilleggSkattesats.trinnskatt, true),
                    },
                ]}
                result={{
                    label: "Sum skatt",
                    value: formatterBeløpForBeregning(barnetilleggSkattesats.sumSkatt, true),
                }}
            />
            <ResultatDescription
                data={[
                    {
                        label: "Inntekt",
                        textRight: false,
                        labelBold: true,
                        value: formatterBeløpForBeregning(barnetillegg.sumInntekt),
                    },
                    {
                        label: "Skatteprosent",
                        textRight: false,
                        labelBold: true,
                        value: `${formatterBeløpForBeregning(barnetilleggSkattesats.sumSkatt, true)} / ${formatterBeløpForBeregning(barnetillegg.sumInntekt)} = ${formatterProsent(barnetilleggSkattesats.skattFaktor)}`,
                    },
                ].filter((d) => d)}
            />
        </div>
    );
};
