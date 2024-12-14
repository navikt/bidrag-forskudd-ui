import { VStack } from "@navikt/ds-react";

import { Beregningsdetaljer } from "../../../../api/BidragBehandlingApiV1";
import { PersonNavn } from "../../../../common/components/PersonNavn";
import { CalculationTabellV2 } from "../../../../common/components/vedtak/CalculationTable";
import { ResultatTable } from "../../../../common/components/vedtak/ResultatTable";
import { formatterBeløpForBeregning, formatterProsent } from "../../../../utils/number-utils";

export default function BeregningsdetaljerUnderholdskostnad({ detaljer }: { detaljer: Beregningsdetaljer }) {
    if (detaljer?.tilsynsutgifterBarn === undefined) return null;
    return (
        <VStack className="w-[700px]" gap="4">
            <CalculationTabellV2
                title="Tilsynsutgifter"
                data={[
                    ...(detaljer.tilsynsutgifterBarn?.flatMap((b) => [
                        {
                            label: <PersonNavn navn={b.gjelderBarn.navn} />,
                            value: `(${formatterBeløpForBeregning(b.totalTilsynsutgift)} - ${formatterBeløpForBeregning(b.kostpenger)}${b.tilleggsstønad ? " - " + formatterBeløpForBeregning(b.tilleggsstønad) : ""}) x 11/12`,
                            result: formatterBeløpForBeregning(b.beløp),
                        },
                    ]) ?? []),
                    {
                        label: "Total",
                        labelBold: true,
                        result: `${formatterBeløpForBeregning(detaljer.sumTilsynsutgifter)}`,
                    },
                ].filter((d) => d)}
            />

            {detaljer.erBegrensetAvMaksTilsyn && (
                <ResultatTable
                    data={[
                        {
                            label: "Totalbeløp begrenset av maks tilsynsutgift",
                            textRight: false,
                            labelBold: true,
                            value: `${formatterBeløpForBeregning(detaljer.totalTilsynsutgift)}`,
                        },
                        {
                            label: "Andel søknadsbarn",
                            textRight: false,
                            labelBold: true,
                            value: `${formatterBeløpForBeregning(detaljer.bruttoBeløp)} / ${formatterBeløpForBeregning(detaljer.sumTilsynsutgifter)} = ${formatterProsent(detaljer.fordelingFaktor)}`,
                        },
                    ].filter((d) => d)}
                />
            )}
            <CalculationTabellV2
                title="Skattefradrag"
                data={[
                    {
                        label: "Maksfradrag",
                        value: `${formatterBeløpForBeregning(detaljer.sjablonMaksFradrag)} X ${formatterProsent(detaljer.skattesatsFaktor)}`,
                        result: formatterBeløpForBeregning(detaljer.skattMaksFradrag),
                    },
                    {
                        label: "Total tilsynsutgift",
                        value: `${formatterBeløpForBeregning(detaljer.totalTilsynsutgift)} X ${formatterProsent(detaljer.skattesatsFaktor)}`,
                        result: formatterBeløpForBeregning(detaljer.skattTotalTilsynsutgift),
                    },
                    {
                        label: "Skattefradrag (laveste verdi)",
                        labelBold: true,
                        result: `${formatterBeløpForBeregning(detaljer.skattefradrag)}`,
                    },
                ].filter((d) => d)}
            />
            <CalculationTabellV2
                title="Beregnet tilsynsutgifter"
                data={[
                    {
                        label: "Faktisk beløp",
                        value: detaljer.erBegrensetAvMaksTilsyn
                            ? `${formatterBeløpForBeregning(detaljer.totalTilsynsutgift)} x ${formatterProsent(detaljer.fordelingFaktor)}`
                            : undefined,
                        result: `${formatterBeløpForBeregning(detaljer.andelBeløp)}`,
                    },
                    {
                        label: "Skattefradrag (per barn)",
                        value: `${formatterBeløpForBeregning(detaljer.skattefradrag)} / ${formatterBeløpForBeregning(detaljer.sjablonAntallBarn)}`,
                        result: `- ${formatterBeløpForBeregning(detaljer.skattefradragPerBarn)}`,
                    },
                    {
                        label: "Resultat",
                        labelBold: true,
                        result: `${formatterBeløpForBeregning(detaljer.nettoBeløp)}`,
                    },
                ].filter((d) => d)}
            />
        </VStack>
    );
}
