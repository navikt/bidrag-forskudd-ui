import { BodyShort, Heading, Label, Table } from "@navikt/ds-react";

import { formatterBeløpForBeregning } from "../../../utils/number-utils";
import { useBidragBeregningPeriode } from "./DetaljertBeregningBidrag";

// eslint-disable-next-line no-empty-pattern
export const BeregningJusterBMsBarnetillegg = () => {
    const {
        beregningsdetaljer: { sluttberegning, delberegningUnderholdskostnad: underholdskostnad },
    } = useBidragBeregningPeriode();

    const uMinusBMsNettoBarnetillegg = Math.max(
        underholdskostnad.underholdskostnad - sluttberegning.nettoBarnetilleggBM,
        0
    );
    function renderResult() {
        if (sluttberegning.justertForNettoBarnetilleggBM) {
            return `Fordelt bidrag (${formatterBeløpForBeregning(sluttberegning.kostnadsberegnetBidrag)}) er høyere enn U - BMs netto barnetillegg (${formatterBeløpForBeregning(uMinusBMsNettoBarnetillegg)}). Fordelt bidrag reduseres til (${formatterBeløpForBeregning(uMinusBMsNettoBarnetillegg)})`;
        } else {
            return `Fordelt bidrag (${formatterBeløpForBeregning(sluttberegning.kostnadsberegnetBidrag)}) er lavere enn U - BMs netto barnetillegg (${formatterBeløpForBeregning(uMinusBMsNettoBarnetillegg)}). Fordelt bidrag reduseres derfor ikke`;
        }
    }
    return (
        <div>
            <Heading size="xsmall">Juster ned til netto barnetillegg til BM</Heading>

            <Table size="small">
                <Table.Body>
                    <Table.Row>
                        <Table.DataCell textSize="small">Underholdskostnad</Table.DataCell>
                        <Table.DataCell colSpan={2} textSize="small">
                            {formatterBeløpForBeregning(underholdskostnad.underholdskostnad)}
                        </Table.DataCell>
                    </Table.Row>
                    <Table.Row>
                        <Table.DataCell textSize="small">BM's netto barnetillegg</Table.DataCell>
                        <Table.DataCell textSize="small">
                            -{formatterBeløpForBeregning(sluttberegning.nettoBarnetilleggBM)}
                        </Table.DataCell>
                    </Table.Row>
                    <Table.Row>
                        <Table.DataCell textSize="small">
                            <Label size="small">Totalt</Label>
                        </Table.DataCell>
                        <Table.DataCell textSize="small">
                            {formatterBeløpForBeregning(uMinusBMsNettoBarnetillegg)}
                        </Table.DataCell>
                    </Table.Row>
                </Table.Body>
            </Table>
            <BodyShort className="pt-2" spacing size="small">
                {renderResult()}
            </BodyShort>
        </div>
    );
};
