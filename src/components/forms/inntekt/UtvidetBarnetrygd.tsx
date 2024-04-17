import { Box, Heading, Table } from "@navikt/ds-react";
import React from "react";

import { Inntektsrapportering, Kilde, Rolletype } from "../../../api/BidragBehandlingApiV1";
import elementId from "../../../constants/elementIds";
import text from "../../../constants/texts";
import { useGetBehandlingV2 } from "../../../hooks/useApiData";
import { InntektFormPeriode } from "../../../types/inntektFormValues";
import LeggTilPeriodeButton from "../../formFields/FormLeggTilPeriode";
import { EditOrSaveButton, InntektTabel, KildeIcon, Periode, TaMed, Totalt } from "./InntektTable";
import { Opplysninger } from "./Opplysninger";

export const UtvidetBarnetrygd = () => {
    const { roller } = useGetBehandlingV2();
    const ident = roller?.find((rolle) => rolle.rolletype === Rolletype.BM)?.ident;
    const fieldName = "utvidetBarnetrygd";

    return (
        <Box padding="4" background="surface-subtle" className="grid gap-y-4">
            <Heading level="3" size="medium" id={elementId.seksjon_inntekt_utvidetbarnetrygd}>
                {text.title.utvidetBarnetrygd}
            </Heading>
            <Opplysninger fieldName={fieldName} />
            <InntektTabel fieldName={fieldName}>
                {({
                    controlledFields,
                    onSaveRow,
                    handleOnSelect,
                    editableRow,
                    onEditRow,
                    addPeriod,
                }: {
                    controlledFields: InntektFormPeriode[];
                    editableRow: number;
                    onSaveRow: (index: number) => void;
                    handleOnSelect: (value: boolean, index: number) => void;
                    onEditRow: (index: number) => void;
                    addPeriod: (periode: InntektFormPeriode) => void;
                }) => (
                    <>
                        {controlledFields.length > 0 && (
                            <div className="overflow-x-auto whitespace-nowrap">
                                <Table size="small" className="table-fixed">
                                    <Table.Header>
                                        <Table.Row className="align-baseline">
                                            <Table.HeaderCell scope="col" align="center" className="w-[84px]">
                                                {text.label.taMed}
                                            </Table.HeaderCell>
                                            <Table.HeaderCell scope="col" className="w-[144px]">
                                                {text.label.fraOgMed}
                                            </Table.HeaderCell>
                                            <Table.HeaderCell scope="col" className="w-[144px]">
                                                {text.label.tilOgMed}
                                            </Table.HeaderCell>
                                            <Table.HeaderCell scope="col" align="center" className="w-[74px]">
                                                {text.label.kilde}
                                            </Table.HeaderCell>
                                            <Table.HeaderCell scope="col" align="right" className="w-[154px]">
                                                {text.label.beløp}
                                            </Table.HeaderCell>
                                            <Table.HeaderCell scope="col" className="w-[56px]"></Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {controlledFields.map((item, index) => (
                                            <Table.Row key={item.id} className="align-top">
                                                <Table.DataCell>
                                                    <TaMed
                                                        fieldName={fieldName}
                                                        index={index}
                                                        handleOnSelect={handleOnSelect}
                                                    />
                                                </Table.DataCell>
                                                <Table.DataCell>
                                                    <Periode
                                                        editableRow={editableRow}
                                                        index={index}
                                                        label={text.label.fraOgMed}
                                                        fieldName={fieldName}
                                                        field="datoFom"
                                                        item={item}
                                                    />
                                                </Table.DataCell>
                                                <Table.DataCell>
                                                    <Periode
                                                        editableRow={editableRow}
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
                                                <Table.DataCell>
                                                    <Totalt
                                                        item={item}
                                                        field={`${fieldName}.${index}`}
                                                        erRedigerbart={
                                                            editableRow === index && item.kilde === Kilde.MANUELL
                                                        }
                                                    />
                                                </Table.DataCell>
                                                <Table.DataCell>
                                                    <EditOrSaveButton
                                                        index={index}
                                                        erMed={item.taMed}
                                                        editableRow={editableRow}
                                                        onEditRow={onEditRow}
                                                        onSaveRow={onSaveRow}
                                                    />
                                                </Table.DataCell>
                                            </Table.Row>
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
