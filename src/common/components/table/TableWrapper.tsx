import { Table } from "@navikt/ds-react";
import React, { ReactElement, ReactNode } from "react";

export const TableWrapper = ({ heading, children }: { heading: string[]; children: ReactNode }) => (
    <div className="overflow-x-auto whitespace-nowrap">
        <Table size="small" className="bg-white">
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
                    <Table.HeaderCell scope="row" key={cell.key} className="align-middle">
                        {cell}
                    </Table.HeaderCell>
                );
            return (
                <Table.DataCell key={cell.key} className="align-middle">
                    {cell}
                </Table.DataCell>
            );
        })}
    </Table.Row>
);

export const TableExpandableRowWrapper = ({ cells, content }: { cells: ReactElement[]; content: ReactNode }) => (
    <Table.ExpandableRow className="align-baseline" content={content} togglePlacement="right">
        {cells.map((cell) => {
            return (
                <Table.DataCell key={cell.key} className="align-middle">
                    {cell}
                </Table.DataCell>
            );
        })}
    </Table.ExpandableRow>
);
