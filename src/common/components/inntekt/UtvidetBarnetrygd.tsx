import { Inntektsrapportering, Kilde, Rolletype } from "@api/BidragBehandlingApiV1";
import LeggTilPeriodeButton from "@common/components/formFields/FormLeggTilPeriode";
import text from "@common/constants/texts";
import { useGetBehandlingV2 } from "@common/hooks/useApiData";
import { InntektFormPeriode } from "@common/types/inntektFormValues";
import { Box, Heading, Table } from "@navikt/ds-react";
import React from "react";

import elementId from "../../../forskudd/constants/elementIds";
import { ExpandableContent } from "./ExpandableContent";
import { EditOrSaveButton, InntektTabel, KildeIcon, Periode, TaMed, Totalt } from "./InntektTable";
import { Opplysninger } from "./Opplysninger";

export const UtvidetBarnetrygd = () => {
    const { roller } = useGetBehandlingV2();
    const ident = roller?.find((rolle) => rolle.rolletype === Rolletype.BM)?.ident;
    const fieldName = "utvidetBarnetrygd";

    return (
        <Box background="surface-subtle" className="grid gap-y-2 px-4 py-2">
            <Heading level="2" size="small" id={elementId.seksjon_inntekt_utvidetbarnetrygd}>
                {text.title.utvidetBarnetrygd}
            </Heading>

            <Opplysninger fieldName={fieldName} />
            <InntektTabel fieldName={fieldName}>
                {({
                    controlledFields,
                    onSaveRow,
                    handleOnSelect,
                    onEditRow,
                    addPeriod,
                }: {
                    controlledFields: InntektFormPeriode[];
                    onSaveRow: (index: number) => void;
                    handleOnSelect: (value: boolean, index: number) => void;
                    onEditRow: (index: number) => void;
                    addPeriod: (periode: InntektFormPeriode) => void;
                }) => (
                    <>
                        {controlledFields.length > 0 && (
                            <div className="overflow-x-auto whitespace-nowrap">
                                <Table size="small" className="table-fixed table bg-white w-fit">
                                    <Table.Header>
                                        <Table.Row className="align-baseline">
                                            <Table.HeaderCell
                                                textSize="small"
                                                scope="col"
                                                align="center"
                                                className="w-[84px]"
                                            >
                                                {text.label.taMed}
                                            </Table.HeaderCell>
                                            <Table.HeaderCell textSize="small" scope="col" className="w-[144px]">
                                                {text.label.fraOgMed}
                                            </Table.HeaderCell>
                                            <Table.HeaderCell textSize="small" scope="col" className="w-[144px]">
                                                {text.label.tilOgMed}
                                            </Table.HeaderCell>
                                            <Table.HeaderCell
                                                textSize="small"
                                                scope="col"
                                                align="center"
                                                className="w-[74px]"
                                            >
                                                {text.label.kilde}
                                            </Table.HeaderCell>
                                            <Table.HeaderCell
                                                textSize="small"
                                                scope="col"
                                                align="right"
                                                className="w-[154px]"
                                            >
                                                {text.label.beløp}
                                            </Table.HeaderCell>
                                            <Table.HeaderCell scope="col" className="w-[56px]"></Table.HeaderCell>
                                            <Table.HeaderCell scope="col" className="w-[56px]"></Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {controlledFields.map((item, index) => (
                                            <Table.ExpandableRow
                                                key={item?.id + item.ident}
                                                content={<ExpandableContent item={item} />}
                                                togglePlacement="right"
                                                className="align-top"
                                                expansionDisabled={item.kilde === Kilde.MANUELL}
                                            >
                                                <Table.DataCell>
                                                    <TaMed
                                                        fieldName={fieldName}
                                                        index={index}
                                                        handleOnSelect={handleOnSelect}
                                                    />
                                                </Table.DataCell>
                                                <Table.DataCell textSize="small">
                                                    <Periode
                                                        index={index}
                                                        label={text.label.fraOgMed}
                                                        fieldName={fieldName}
                                                        field="datoFom"
                                                        item={item}
                                                    />
                                                </Table.DataCell>
                                                <Table.DataCell textSize="small">
                                                    <Periode
                                                        index={index}
                                                        label={text.label.tilOgMed}
                                                        fieldName={fieldName}
                                                        field="datoTom"
                                                        item={item}
                                                    />
                                                </Table.DataCell>
                                                <Table.DataCell>
                                                    <KildeIcon kilde={item.kilde} />
                                                </Table.DataCell>
                                                <Table.DataCell textSize="small">
                                                    <Totalt item={item} field={`${fieldName}.${index}`} />
                                                </Table.DataCell>
                                                <Table.DataCell>
                                                    <EditOrSaveButton
                                                        index={index}
                                                        item={item}
                                                        onEditRow={onEditRow}
                                                        onSaveRow={onSaveRow}
                                                    />
                                                </Table.DataCell>
                                            </Table.ExpandableRow>
                                        ))}
                                    </Table.Body>
                                </Table>
                            </div>
                        )}

                        <LeggTilPeriodeButton
                            addPeriode={() =>
                                addPeriod({
                                    ident,
                                    datoFom: null,
                                    datoTom: null,
                                    beløp: 0,
                                    rapporteringstype: Inntektsrapportering.UTVIDET_BARNETRYGD,
                                    taMed: true,
                                    kilde: Kilde.MANUELL,
                                    inntektsposter: [],
                                    inntektstyper: [],
                                })
                            }
                        />
                    </>
                )}
            </InntektTabel>
        </Box>
    );
};
