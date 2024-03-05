import { BodyShort, Box, Button, Heading, Table } from "@navikt/ds-react";
import React from "react";
import { useFormContext } from "react-hook-form";

import { Inntektsrapportering, Kilde, Rolletype } from "../../../api/BidragBehandlingApiV1";
import { KildeTexts } from "../../../enum/KildeTexts";
import { useGetBehandlingV2 } from "../../../hooks/useApiData";
import { InntektFormPeriode, InntektFormValues } from "../../../types/inntektFormValues";
import { FormControlledCheckbox } from "../../formFields/FormControlledCheckbox";
import { EditOrSaveButton, InntektTabel, Periode, Totalt } from "./InntektTable";

export const Småbarnstillegg = () => {
    const { roller } = useGetBehandlingV2();
    const {
        formState: { errors },
    } = useFormContext<InntektFormValues>();
    const ident = roller?.find((rolle) => rolle.rolletype === Rolletype.BM)?.ident;
    const fieldName = "småbarnstillegg";
    const fieldErrors = errors?.småbarnstillegg;

    return (
        <Box padding="4" background="surface-subtle" className="grid gap-y-4">
            <Heading level="3" size="medium">
                Småbarnstillegg
            </Heading>
            <InntektTabel fieldName={fieldName} fieldErrors={fieldErrors}>
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
                                <Table size="small">
                                    <Table.Header>
                                        <Table.Row className="align-baseline">
                                            <Table.HeaderCell scope="col" className="w-[84px]">
                                                Ta med
                                            </Table.HeaderCell>
                                            <Table.HeaderCell scope="col" className="w-[145px]">
                                                Fra og med
                                            </Table.HeaderCell>
                                            <Table.HeaderCell scope="col" className="w-[145px]">
                                                Til og med
                                            </Table.HeaderCell>
                                            <Table.HeaderCell scope="col">Kilde</Table.HeaderCell>
                                            <Table.HeaderCell scope="col" className="w-[154px]">
                                                Beløp
                                            </Table.HeaderCell>
                                            <Table.HeaderCell scope="col"></Table.HeaderCell>
                                            <Table.HeaderCell scope="col"></Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {controlledFields.map((item, index) => (
                                            <Table.Row key={item.ident + index} className="h-[41px] align-baseline">
                                                <Table.DataCell className="w-[84px]" align="center">
                                                    <FormControlledCheckbox
                                                        className="w-full flex justify-center"
                                                        name={`${fieldName}.${index}.taMed`}
                                                        onChange={(value) =>
                                                            handleOnSelect(value.target.checked, index)
                                                        }
                                                        legend=""
                                                    />
                                                </Table.DataCell>
                                                <Table.DataCell>
                                                    <Periode
                                                        editableRow={editableRow}
                                                        index={index}
                                                        label="Fra og med"
                                                        fieldName={fieldName}
                                                        field="datoFom"
                                                        item={item}
                                                    />
                                                </Table.DataCell>
                                                <Table.DataCell>
                                                    <Periode
                                                        editableRow={editableRow}
                                                        index={index}
                                                        label="Til og med"
                                                        fieldName={fieldName}
                                                        field="datoTom"
                                                        item={item}
                                                    />
                                                </Table.DataCell>
                                                <Table.DataCell>
                                                    <BodyShort className="min-w-[215px] capitalize">
                                                        {KildeTexts[item.kilde]}
                                                    </BodyShort>
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
                        <Button
                            variant="tertiary"
                            type="button"
                            size="small"
                            className="w-fit"
                            onClick={() =>
                                addPeriod({
                                    ident,
                                    datoFom: null,
                                    datoTom: null,
                                    beløp: 0,
                                    rapporteringstype: Inntektsrapportering.SMABARNSTILLEGG,
                                    taMed: true,
                                    kilde: Kilde.MANUELL,
                                    inntektsposter: [],
                                    inntektstyper: [],
                                })
                            }
                        >
                            + Legg til periode
                        </Button>
                    </>
                )}
            </InntektTabel>
        </Box>
    );
};
