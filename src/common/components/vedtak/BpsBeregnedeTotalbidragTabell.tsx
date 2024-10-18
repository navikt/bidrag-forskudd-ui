import { ChevronDownIcon, ChevronUpIcon, ExternalLinkIcon } from "@navikt/aksel-icons";
import { BodyShort, Heading, HelpText, Link, Table } from "@navikt/ds-react";
import { useState } from "react";
import React from "react";

import { formatterBeløpForBeregning } from "../../../utils/number-utils";
import { useGetBeregningSærbidrag } from "../../hooks/useApiData";
import { CalculationTabell } from "./CalculationTable";

export const BpsBeregnedeTotalbidragTabell = () => {
    const { data: beregnetSærbidrag } = useGetBeregningSærbidrag();

    const delberegning = beregnetSærbidrag.resultat.delberegningBidragspliktigesBeregnedeTotalBidrag;
    const colPaddingClassname = "px-1";
    const [expandedRows, setExpandedRows] = useState<{ [key: number]: boolean }>({});

    const toggleRow = (rowIndex: number) => {
        setExpandedRows((prevState) => ({
            ...prevState,
            [rowIndex]: !prevState[rowIndex],
        }));
    };
    return (
        <div>
            <div>
                <Heading size="xsmall" className="inline-block align-middle">
                    {"BPs beregnede totalbidrag"}{" "}
                </Heading>
                <Link
                    className="pl-2"
                    inlineText
                    href="https://lovdata.no/nav/rundskriv/r55-02/KAPITTEL_4-2-3-2-2#KAPITTEL_4-2-3-2-2"
                >
                    {"Rundskriv"} <ExternalLinkIcon aria-hidden />
                </Link>
            </div>
            <table className="table-auto pb-[5px] border-collapse text-left border-spacing-2 w-full">
                <thead>
                    <tr>
                        <th></th>
                        <th className="pr-1">{"Barn"}</th>
                        <th className={`${colPaddingClassname}`}>{"Saksnummer"}</th>
                        <th className={`${colPaddingClassname} text-right`}>{"Løpende bidrag"}</th>
                        <th className={`${colPaddingClassname} text-right`}>
                            <div className="inline-block align-middle">Samvær</div>
                            <HelpText wrapperClassName="inline-block align-middle" className="size-4" placement="top">
                                Samværsfradraget beregnet etter dagens sats
                            </HelpText>
                        </th>
                        <th className={`${colPaddingClassname} text-right`}>
                            <div className="inline-block align-middle">Reduksjon av U</div>

                            <HelpText wrapperClassName="inline-block align-middle" className="size-4" placement="top">
                                Reduksjon av U viser hvor mye den bidragspliktiges andel av U er redusert på grunn av
                                feks bidragsevnen. Reduksjonen er beregnet som forskjellen mellom beregnet bidrag og
                                faktisk bidrag
                            </HelpText>
                        </th>
                        <th className={`${colPaddingClassname} text-right`}>Sum</th>
                    </tr>
                </thead>
                <tbody>
                    {delberegning.beregnetBidragPerBarnListe.map(
                        ({ beregnetBidragPerBarn: row, personidentBarn }, rowIndex) => (
                            <React.Fragment key={rowIndex}>
                                <tr onClick={() => toggleRow(rowIndex)} className="cursor-pointer">
                                    <td>{expandedRows[rowIndex] ? <ChevronUpIcon /> : <ChevronDownIcon />}</td>
                                    <td className={`${colPaddingClassname}`}>{personidentBarn}</td>
                                    <td className={`${colPaddingClassname}`}>{row.saksnummer}</td>
                                    <td className={`${colPaddingClassname} text-right`}>
                                        {formatterBeløpForBeregning(row.løpendeBeløp, true)}
                                    </td>
                                    <td className={`${colPaddingClassname} text-right`}>
                                        {formatterBeløpForBeregning(row.samværsfradrag, true)}
                                    </td>
                                    <td className={`${colPaddingClassname} text-right`}>
                                        {formatterBeløpForBeregning(row.reduksjonUnderholdskostnad, true)}
                                    </td>
                                    <td className={`${colPaddingClassname} text-right`}>
                                        {formatterBeløpForBeregning(row.beregnetBidrag, true)}
                                    </td>
                                </tr>
                                {expandedRows[rowIndex] && (
                                    <tr className="transition-all duration-150 ease-in">
                                        <td colSpan={8} className="p-4 bg-gray-100">
                                            <CalculationTabell
                                                className="w-[200px] [&_td]:w-full"
                                                title="Reduksjon av U"
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
                                                    label: "Reduksjon av U",
                                                    value: formatterBeløpForBeregning(
                                                        row.reduksjonUnderholdskostnad,
                                                        true
                                                    ),
                                                }}
                                            />
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        )
                    )}
                </tbody>
            </table>
        </div>
    );
};

export const BpsBeregnedeTotalbidragTabellV2 = () => {
    const { data: beregnetSærbidrag } = useGetBeregningSærbidrag();

    const delberegning = beregnetSærbidrag.resultat.delberegningBidragspliktigesBeregnedeTotalBidrag;

    return (
        <div>
            <div>
                <Heading size="xsmall" className="inline-block align-middle">
                    {"BPs beregnede totalbidrag"}{" "}
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
                className="table-auto pb-[5px] border-collapse text-left border-spacing-2 w-full [&_.navds-table\_\_data-cell]:p-0 [&_.navds-table\_\_data-cell]:pl-2 [&_.navds-table\_\_data-cell]:pr-2 "
                // className="[&_.navds-table\_\_body_.navds-table\_\_row--shade-on-hover]:hover:bg-inherit[&_.navds-table\_\_expanded-row_.navds-table\_\_expanded-row-content]:p-0 [&_.navds-table\_\_expanded-row_.navds-table\_\_expanded-row-content]:pb-2"
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
                                Reduksjon av U er differansen mellom det beregnede bidraget og det faktiske bidraget i
                                forrige vedtak.
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
                                        <BodyShort size="small">
                                            <CalculationTabell
                                                className="w-[200px] [&_td]:w-full"
                                                title="Reduksjon av U"
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
                                                    value: formatterBeløpForBeregning(
                                                        row.reduksjonUnderholdskostnad,
                                                        true
                                                    ),
                                                }}
                                            />
                                        </BodyShort>
                                    }
                                >
                                    <Table.DataCell align="left">{personidentBarn}</Table.DataCell>
                                    <Table.DataCell align="left">{row.saksnummer}</Table.DataCell>
                                    <Table.DataCell align="right">
                                        {formatterBeløpForBeregning(row.løpendeBeløp, true)}
                                    </Table.DataCell>
                                    <Table.DataCell align="right">
                                        {formatterBeløpForBeregning(row.samværsfradrag, true)}
                                    </Table.DataCell>
                                    <Table.DataCell align="right">
                                        {formatterBeløpForBeregning(row.reduksjonUnderholdskostnad, true)}
                                    </Table.DataCell>
                                    <Table.DataCell align="right">
                                        {formatterBeløpForBeregning(row.beregnetBidrag, true)}
                                    </Table.DataCell>
                                </Table.ExpandableRow>
                            </React.Fragment>
                        )
                    )}
                    <Table.Row className="!bg-inherit  border-t border-solid border-black border-b-2 border-l-0 border-r-0">
                        <Table.DataCell colSpan={6} align="right">
                            {"Beregnet totalbidrag:"}
                        </Table.DataCell>
                        <Table.DataCell colSpan={1} align="right">
                            {formatterBeløpForBeregning(delberegning.bidragspliktigesBeregnedeTotalbidrag, true)}
                        </Table.DataCell>
                    </Table.Row>
                </Table.Body>
            </Table>
        </div>
    );
};
