import { dateToDDMMYYYYString } from "@navikt/bidrag-ui-common";
import { BodyShort, Box, Button, Heading, Table } from "@navikt/ds-react";
import React from "react";
import { useFormContext } from "react-hook-form";

import { Inntektsrapportering, Kilde, Rolletype } from "../../../api/BidragBehandlingApiV1";
import text from "../../../constants/texts";
import { useGetBehandlingV2 } from "../../../hooks/useApiData";
import { hentVisningsnavn } from "../../../hooks/useVisningsnavn";
import { InntektFormPeriode, InntektFormValues } from "../../../types/inntektFormValues";
import { getYearFromDate } from "../../../utils/date-utils";
import { FormControlledCheckbox } from "../../formFields/FormControlledCheckbox";
import { FormControlledSelectField } from "../../formFields/FormControlledSelectField";
import AinntektLink from "./AinntektLink";
import { EditOrSaveButton, InntektTabel, Periode, Totalt } from "./InntektTable";

const Beskrivelse = ({
    item,
    field,
    erRedigerbart,
}: {
    item: InntektFormPeriode;
    field: string;
    erRedigerbart: boolean;
}) => {
    return erRedigerbart ? (
        <FormControlledSelectField
            name={`${field}.rapporteringstype`}
            label="Beskrivelse"
            options={[{ value: "", text: text.select.inntektPlaceholder }].concat(
                [
                    Inntektsrapportering.LONNMANUELTBEREGNET,
                    Inntektsrapportering.KAPITALINNTEKT_EGNE_OPPLYSNINGER,
                    Inntektsrapportering.PERSONINNTEKT_EGNE_OPPLYSNINGER,
                    Inntektsrapportering.SAKSBEHANDLER_BEREGNET_INNTEKT,
                    Inntektsrapportering.NAeRINGSINNTEKTMANUELTBEREGNET,
                    Inntektsrapportering.YTELSE_FRA_OFFENTLIG_MANUELT_BEREGNET,
                ].map((value) => ({
                    value,
                    text: hentVisningsnavn(value),
                }))
            )}
            hideLabel
        />
    ) : (
        <BodyShort className="min-w-[215px] capitalize">
            {hentVisningsnavn(item.rapporteringstype, getYearFromDate(item.datoFom))}
        </BodyShort>
    );
};
const ExpandableContent = ({ item }: { item: InntektFormPeriode }) => {
    return (
        <>
            <BodyShort size="small">
                Periode: {item.datoFom && dateToDDMMYYYYString(new Date(item.datoFom))} -{" "}
                {item.datoTom && dateToDDMMYYYYString(new Date(item.datoTom))}
            </BodyShort>
            {item.inntektsposter.map((inntektpost) => (
                <BodyShort size="small" key={inntektpost.kode}>
                    {inntektpost.visningsnavn}: {inntektpost.beløp}
                </BodyShort>
            ))}
        </>
    );
};
export const SkattepliktigeOgPensjonsgivende = () => {
    const { inntekter, roller } = useGetBehandlingV2();
    const {
        formState: { errors },
    } = useFormContext<InntektFormValues>();
    const ident = roller?.find((rolle) => rolle.rolletype === Rolletype.BM)?.ident;
    const fieldName = `årsinntekter.${ident}` as const;
    const fieldErrors = errors?.årsinntekter?.[ident];
    const årsinntekter = inntekter.årsinntekter?.filter((inntekt) => inntekt.ident === ident);

    return (
        <Box padding="4" background="surface-subtle" className="grid gap-y-4">
            <div className="flex gap-x-4">
                <Heading level="3" size="medium">
                    Skattepliktige og pensjonsgivende inntekt
                </Heading>
                {årsinntekter?.length > 0 && <AinntektLink ident={ident} />}
            </div>
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
                                            <Table.HeaderCell scope="col">Beskrivelse</Table.HeaderCell>
                                            <Table.HeaderCell scope="col" className="w-[154px]">
                                                Beløp
                                            </Table.HeaderCell>
                                            <Table.HeaderCell scope="col"></Table.HeaderCell>
                                            <Table.HeaderCell scope="col"></Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {controlledFields.map((item, index) => (
                                            <Table.ExpandableRow
                                                key={item.ident + index}
                                                content={<ExpandableContent item={item} />}
                                                togglePlacement="right"
                                                className="h-[41px] align-baseline"
                                            >
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
                                                    <Beskrivelse
                                                        item={item}
                                                        field={`${fieldName}.${index}`}
                                                        erRedigerbart={
                                                            editableRow === index && item.kilde === Kilde.MANUELL
                                                        }
                                                    />
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
                                            </Table.ExpandableRow>
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
                                    rapporteringstype: "",
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
