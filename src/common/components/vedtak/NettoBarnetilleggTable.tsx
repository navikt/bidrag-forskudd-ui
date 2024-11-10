import { Heading, Table } from "@navikt/ds-react";

import { formatterBeløpForBeregning, formatterProsent } from "../../../utils/number-utils";
import { ResultatTable } from "./ResultatTable";

type NettoBarnetilleggTableProps = {};
// eslint-disable-next-line no-empty-pattern
export const NettoBarnetilleggTable = ({}: NettoBarnetilleggTableProps) => {
    return (
        <div>
            <Heading size="xsmall">Netto barnetillegg</Heading>
            <ResultatTable
                data={[
                    {
                        label: "Skatteprosent",
                        textRight: false,
                        value: formatterProsent(0.4),
                    },
                    {
                        label: "Inntekt siste 12 mnd",
                        textRight: false,
                        value: formatterBeløpForBeregning(400000),
                    },
                ].filter((d) => d)}
            />
            <Table size="small" className="table-fixed table bg-white w-full">
                <Table.Header>
                    <Table.Row className="align-baseline">
                        <Table.HeaderCell textSize="small" scope="col" align="left" className="w-[200px]">
                            Type barnetillegg
                        </Table.HeaderCell>
                        <Table.HeaderCell textSize="small" scope="col" align="left">
                            Brutto
                        </Table.HeaderCell>
                        <Table.HeaderCell textSize="small" scope="col" align="left">
                            Netto
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    <Table.Row className="align-top">
                        <Table.DataCell textSize="small">Pensjon</Table.DataCell>
                        <Table.DataCell textSize="small">{formatterBeløpForBeregning(9000)}</Table.DataCell>
                        <Table.DataCell textSize="small">{formatterBeløpForBeregning(5400)}</Table.DataCell>
                    </Table.Row>
                    <Table.Row className="align-top">
                        <Table.DataCell colSpan={2} textSize="small">
                            Resultat
                        </Table.DataCell>
                        <Table.DataCell textSize="small">{formatterBeløpForBeregning(9999)}</Table.DataCell>
                    </Table.Row>
                </Table.Body>
            </Table>
        </div>
    );
};
