import { Table } from "@navikt/ds-react";
import React, { ReactElement, ReactNode } from "react";

export const TableWrapper = ({ heading, children }: { heading: string[]; children: ReactNode }) => (
    <Table size="small" className="w-fit" zebraStripes>
        <Table.Header>
            <Table.Row className="align-baseline">
                {heading.map((header) => (
                    <Table.HeaderCell scope="col" key={header}>
                        {header}
                    </Table.HeaderCell>
                ))}
            </Table.Row>
        </Table.Header>
        <Table.Body>{children}</Table.Body>
    </Table>
);

export const TableRowWrapper = ({ cells }: { cells: ReactElement[] }) => (
    <Table.Row className="align-baseline">
        {cells.map((cell, index) => {
            if (!index)
                return (
                    <Table.HeaderCell scope="row" key={cell.key}>
                        {cell}
                    </Table.HeaderCell>
                );
            return <Table.DataCell key={index}>{cell}</Table.DataCell>;
        })}
    </Table.Row>
);
