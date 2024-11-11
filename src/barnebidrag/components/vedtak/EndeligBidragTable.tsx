import { BodyShort, Heading, Label, Table } from "@navikt/ds-react";

import { DelberegningUnderholdskostnad, SluttberegningBarnebidrag } from "../../../api/BidragBehandlingApiV1";
import { formatterBeløpForBeregning } from "../../../utils/number-utils";

type EndeligBidragTableProps = {
    sluttberegning: SluttberegningBarnebidrag;
    underholdskostnad: DelberegningUnderholdskostnad;
};
// eslint-disable-next-line no-empty-pattern
export const EndeligBidragTable = ({ sluttberegning, underholdskostnad }: EndeligBidragTableProps) => {
    const uMinusBMsNettoBarnetillegg = Math.max(
        underholdskostnad.underholdskostnad - sluttberegning.nettoBarnetilleggBM,
        0
    );
    function renderResult() {
        if (sluttberegning.justertForNettoBarnetilleggBM) {
            return `Endelig bidrag (${formatterBeløpForBeregning(sluttberegning.beregnetBeløp)}) er høyere enn U - BMs netto barnetillegg (${formatterBeløpForBeregning(uMinusBMsNettoBarnetillegg)}). Endelig bidrag reduseres til (${formatterBeløpForBeregning(sluttberegning.resultatBeløp)})`;
        } else {
            return `Endelig bidrag (${formatterBeløpForBeregning(sluttberegning.beregnetBeløp)}) er lavere enn U - BMs netto barnetillegg (${formatterBeløpForBeregning(uMinusBMsNettoBarnetillegg)}). Endelig bidrag reduseres derfor ikke`;
        }
    }
    return (
        <div>
            <Heading size="xsmall">Endelig bidrag</Heading>

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
