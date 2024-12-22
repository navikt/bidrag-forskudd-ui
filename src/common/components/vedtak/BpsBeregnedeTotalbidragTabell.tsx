import { ExternalLinkIcon } from "@navikt/aksel-icons";
import { Heading, HelpText, Link, Table } from "@navikt/ds-react";
import React from "react";

import { formatterBeløpForBeregning } from "../../../utils/number-utils";
import { useGetBeregningSærbidrag } from "../../hooks/useApiData";
import { CalculationTabell } from "./CalculationTable";

export const BpsBeregnedeTotalbidragTabell = () => {
    const { data: beregnetSærbidrag } = useGetBeregningSærbidrag();

    const delberegning = beregnetSærbidrag.resultat.delberegningBidragspliktigesBeregnedeTotalBidrag;

    return (
        <div>
            <div>
                <Heading size="xsmall" className="inline-block align-middle">
                    {"BP's beregnede totalbidrag"}{" "}
                </Heading>
                <Link
                    className="pl-2 align-middle"
                    inlineText
                    href="https://lovdata.no/nav/rundskriv/r55-02/KAPITTEL_4-2-3-2-2#KAPITTEL_4-2-3-2-2"
                >
                    {"Rundskriv"} <ExternalLinkIcon aria-hidden />
                </Link>
            </div>
            <Table
                size="small"
                zebraStripes
                className="table-auto pb-[5px] border-collapse text-left border-spacing-2 w-full [&_.navds-table\_\_data-cell]:p-0 [&_.navds-table\_\_data-cell]:pl-2 [&_.navds-table\_\_data-cell]:pr-2 "
            >
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell textSize="small" align="left"></Table.HeaderCell>
                        <Table.HeaderCell textSize="small" align="left">
                            {"Barn"}
                        </Table.HeaderCell>
                        <Table.HeaderCell textSize="small" align="left">
                            {"Saksnummer"}
                        </Table.HeaderCell>
                        <Table.HeaderCell textSize="small" align="right">
                            {"Løpende bidrag"}
                        </Table.HeaderCell>
                        <Table.HeaderCell textSize="small" align="right" className="pl-4">
                            <div className="inline-block align-middle">Samvær</div>
                            <HelpText wrapperClassName="inline-block align-middle" className="size-4" placement="top">
                                Samværsfradraget beregnet etter dagens sats
                            </HelpText>
                        </Table.HeaderCell>
                        <Table.HeaderCell textSize="small" align="right" className="pl-4">
                            <div className="inline-block align-middle whitespace-pre-wrap w-[110px]">
                                Reduksjon av BPs andel av U
                            </div>

                            <HelpText wrapperClassName="inline-block align-middle" className="size-4" placement="left">
                                Reduksjon av BPs andel av U er differansen mellom det beregnede bidraget og det faktiske
                                bidraget i forrige vedtak.
                            </HelpText>
                        </Table.HeaderCell>
                        <Table.HeaderCell textSize="small" align="right">
                            Sum
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {delberegning.beregnetBidragPerBarnListe.map(
                        ({ beregnetBidragPerBarn: row, personidentBarn }, rowIndex) => (
                            <React.Fragment key={rowIndex}>
                                <Table.ExpandableRow
                                    className="cursor-pointer"
                                    expandOnRowClick
                                    content={
                                        <CalculationTabell
                                            zebraStripes={false}
                                            className="w-[250px] [&_Table.DataCell]:w-full [&_.navds-table\_\_row]:bg-inherit"
                                            title="Reduksjon av BPs andel av U"
                                            data={[
                                                {
                                                    label: "Beregnet bidrag",
                                                    result: formatterBeløpForBeregning(row.beregnetBeløp, true),
                                                },
                                                {
                                                    label: "Faktisk bidrag",
                                                    result: (
                                                        <div className="flex flex-row justify-end gap-1">
                                                            <div>-</div>
                                                            {formatterBeløpForBeregning(row.faktiskBeløp, true)}
                                                        </div>
                                                    ),
                                                },
                                            ]}
                                            result={{
                                                label: "Resultat",
                                                value: formatterBeløpForBeregning(row.reduksjonUnderholdskostnad, true),
                                            }}
                                        />
                                    }
                                >
                                    <Table.DataCell align="left" textSize="small">
                                        {personidentBarn}
                                    </Table.DataCell>
                                    <Table.DataCell align="left" textSize="small">
                                        {row.saksnummer}
                                    </Table.DataCell>
                                    <Table.DataCell align="right">
                                        {formatterBeløpForBeregning(row.løpendeBeløp, true)}
                                    </Table.DataCell>
                                    <Table.DataCell align="right" textSize="small">
                                        {formatterBeløpForBeregning(row.samværsfradrag, true)}
                                    </Table.DataCell>
                                    <Table.DataCell align="right" textSize="small">
                                        {formatterBeløpForBeregning(row.reduksjonUnderholdskostnad, true)}
                                    </Table.DataCell>
                                    <Table.DataCell align="right" textSize="small">
                                        {formatterBeløpForBeregning(row.beregnetBidrag, true)}
                                    </Table.DataCell>
                                </Table.ExpandableRow>
                            </React.Fragment>
                        )
                    )}
                    <Table.Row className="!bg-inherit  border-t border-solid border-black border-b-2 border-l-0 border-r-0">
                        <Table.DataCell colSpan={6} align="right" textSize="small" className="font-bold">
                            {"Beregnet totalbidrag:"}
                        </Table.DataCell>
                        <Table.DataCell colSpan={1} align="right" textSize="small">
                            {formatterBeløpForBeregning(delberegning.bidragspliktigesBeregnedeTotalbidrag, true)}
                        </Table.DataCell>
                    </Table.Row>
                </Table.Body>
            </Table>
        </div>
    );
};
