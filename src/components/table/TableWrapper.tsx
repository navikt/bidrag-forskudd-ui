import { Table } from "@navikt/ds-react";
import React, { ReactElement, ReactNode } from "react";

export const TableWrapper = ({ heading, children }: { heading: string[]; children: ReactNode }) => (
    <div className="overflow-x-scroll">
        <Table size="small" zebraStripes>
            <Table.Header>
                <Table.Row className="align-baseline">
                    {heading.map((header, index) => (
                        <Table.HeaderCell scope="col" key={`${header}-${index}`}>
                            {header}
                        </Table.HeaderCell>
                    ))}
                </Table.Row>
            </Table.Header>
            <Table.Body>{children}</Table.Body>
        </Table>
    </div>
);

export const TableRowWrapper = ({ cells }: { cells: ReactElement[] }) => (
    <Table.Row className="align-baseline">
        {cells.map((cell, index) => {
            if (!index)
                return (
                    <Table.HeaderCell scope="row" key={cell.key} className="align-top">
                        {cell}
                    </Table.HeaderCell>
                );
            return (
                <Table.DataCell key={cell.key} className="align-top">
                    {cell}
                </Table.DataCell>
            );
        })}
    </Table.Row>
);
