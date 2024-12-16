import { VStack } from "@navikt/ds-react";

import { UnderholdskostnadPeriodeBeregningsdetaljer } from "../../../../api/BidragBehandlingApiV1";
import { PersonNavn } from "../../../../common/components/PersonNavn";
import { CalculationTabellV2 } from "../../../../common/components/vedtak/CalculationTable";
import { ResultatTable } from "../../../../common/components/vedtak/ResultatTable";
import { formatterBeløpForBeregning, formatterProsent } from "../../../../utils/number-utils";

export default function BeregningsdetaljerUnderholdskostnad({
    detaljer,
}: {
    detaljer: UnderholdskostnadPeriodeBeregningsdetaljer;
}) {
    if (detaljer?.tilsynsutgifterBarn === undefined) return null;
    const tilleggstønad = detaljer.tilsynsutgifterBarn?.filter((b) => b.tilleggsstønadDagsats !== undefined) ?? [];
    return (
        <VStack className="w-[700px]" gap="4">
            <ResultatTable
                data={[
                    {
                        label: "Antall barn under 12 år",
                        textRight: false,
                        value: `${formatterBeløpForBeregning(detaljer.antallBarnBMUnderTolvÅr)}`,
                    },
                ].filter((d) => d)}
            />
            {tilleggstønad.length > 0 && (
                <CalculationTabellV2
                    title="Tilleggstønad"
                    data={detaljer.tilsynsutgifterBarn
                        ?.filter((b) => b.tilleggsstønadDagsats !== undefined)
                        .map((b) => ({
                            label: <PersonNavn navn={b.gjelderBarn.navn} />,
                            value: `(${formatterBeløpForBeregning(b.tilleggsstønadDagsats)} x 260) / 12`,
                            result: formatterBeløpForBeregning(b.tilleggsstønad),
                        }))
                        .filter((d) => d)}
                />
            )}
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
                            value: `${formatterBeløpForBeregning(detaljer.bruttoTilsynsutgift)} / ${formatterBeløpForBeregning(detaljer.sumTilsynsutgifter)} = ${formatterProsent(detaljer.fordelingFaktor)}`,
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
                        result: formatterBeløpForBeregning(detaljer.skattefradragMaksFradrag),
                    },
                    {
                        label: "Total tilsynsutgift",
                        value: `${formatterBeløpForBeregning(detaljer.totalTilsynsutgift)} X ${formatterProsent(detaljer.skattesatsFaktor)}`,
                        result: formatterBeløpForBeregning(detaljer.skattefradragTotalTilsynsutgift),
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
                        label: "Brutto beløp",
                        value: detaljer.erBegrensetAvMaksTilsyn
                            ? `${formatterBeløpForBeregning(detaljer.totalTilsynsutgift)} x ${formatterProsent(detaljer.fordelingFaktor)}`
                            : undefined,
                        result: `${formatterBeløpForBeregning(detaljer.justertBruttoTilsynsutgift)}`,
                    },
                    {
                        label: "Skattefradrag (per barn)",
                        value: `${formatterBeløpForBeregning(detaljer.skattefradrag)} / ${formatterBeløpForBeregning(detaljer.antallBarnBMUnderTolvÅr)}`,
                        result: `- ${formatterBeløpForBeregning(detaljer.skattefradragPerBarn)}`,
                    },
                    {
                        label: "Resultat",
                        labelBold: true,
                        result: `${formatterBeløpForBeregning(detaljer.nettoTilsynsutgift)}`,
                    },
                ].filter((d) => d)}
            />
        </VStack>
    );
}
