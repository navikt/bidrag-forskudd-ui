import { dateToDDMMYYYYString, ObjectUtils } from "@navikt/bidrag-ui-common";
import { BodyShort, Box, Heading, Table } from "@navikt/ds-react";
import React from "react";
import { useFormContext } from "react-hook-form";

import { Inntektsrapportering, Kilde } from "../../../api/BidragBehandlingApiV1";
import text from "../../../constants/texts";
import { useGetBehandlingV2 } from "../../../hooks/useApiData";
import { hentVisningsnavn } from "../../../hooks/useVisningsnavn";
import { InntektFormPeriode, InntektFormValues } from "../../../types/inntektFormValues";
import { getYearFromDate } from "../../../utils/date-utils";
import { FormControlledSelectField } from "../../formFields/FormControlledSelectField";
import LeggTilPeriodeButton from "../../formFields/FormLeggTilPeriode";
import AinntektLink from "./AinntektLink";
import { EditOrSaveButton, InntektTabel, KildeIcon, Periode, TaMed, Totalt } from "./InntektTable";

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
            label={text.label.beskrivelse}
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
        <BodyShort className="capitalize leading-8">
            {hentVisningsnavn(item.rapporteringstype, getYearFromDate(item.datoFom))}
        </BodyShort>
    );
};
const ExpandableContent = ({ item }: { item: InntektFormPeriode }) => {
    return (
        <>
            <BodyShort size="small">
                Periode: {item.opprinneligFom && dateToDDMMYYYYString(new Date(item.opprinneligFom))} -{" "}
                {item.opprinneligTom && dateToDDMMYYYYString(new Date(item.opprinneligTom))}
            </BodyShort>
            <dl className="bd_datadisplay">
                {item.inntektsposter.map((inntektpost) => (
                    <BodyShort size="small" key={inntektpost.kode}>
                        <dt>{inntektpost.visningsnavn}</dt>
                        <dd>{inntektpost.beløp}</dd>
                    </BodyShort>
                ))}
            </dl>
        </>
    );
};
export const SkattepliktigeOgPensjonsgivende = ({ ident }: { ident: string }) => {
    const { inntekter } = useGetBehandlingV2();
    const { clearErrors, getValues, setError } = useFormContext<InntektFormValues>();
    const fieldName = `årsinntekter.${ident}` as const;
    const årsinntekter = inntekter.årsinntekter?.filter((inntekt) => inntekt.ident === ident);

    const customRowValidation = (fieldName: `årsinntekter.${string}.${number}`) => {
        const periode = getValues(fieldName);
        if (ObjectUtils.isEmpty(periode.rapporteringstype)) {
            setError(`${fieldName}.rapporteringstype`, {
                type: "notValid",
                message: text.error.inntektType,
            });
        } else {
            clearErrors(`${fieldName}.rapporteringstype`);
        }
    };

    return (
        <Box padding="4" background="surface-subtle" className="grid gap-y-4">
            <div className="flex gap-x-4">
                <Heading level="3" size="medium">
                    {text.title.skattepliktigeogPensjonsgivendeInntekt}
                </Heading>
                {årsinntekter?.length > 0 && <AinntektLink ident={ident} />}
            </div>
            <InntektTabel fieldName={fieldName} customRowValidation={customRowValidation}>
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
                                            <Table.HeaderCell scope="col" className="w-[252px]">
                                                {text.label.beskrivelse}
                                            </Table.HeaderCell>
                                            <Table.HeaderCell scope="col" align="center" className="w-[74px]">
                                                {text.label.kilde}
                                            </Table.HeaderCell>
                                            <Table.HeaderCell scope="col" align="right" className="w-[154px]">
                                                {text.label.beløp}
                                            </Table.HeaderCell>
                                            <Table.HeaderCell scope="col" className="w-[50px]"></Table.HeaderCell>
                                            <Table.HeaderCell scope="col" className="w-[50px]"></Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {controlledFields.map((item, index) => (
                                            <Table.ExpandableRow
                                                key={item?.id + item.ident}
                                                content={<ExpandableContent item={item} />}
                                                togglePlacement="right"
                                                className="align-top"
                                                expansionDisabled={item.kilde == Kilde.MANUELL}
                                            >
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
                                                    <Beskrivelse
                                                        item={item}
                                                        field={`${fieldName}.${index}`}
                                                        erRedigerbart={
                                                            editableRow === index && item.kilde === Kilde.MANUELL
                                                        }
                                                    />
                                                </Table.DataCell>
                                                <Table.DataCell>
                                                    <KildeIcon kilde={item.kilde} />
                                                </Table.DataCell>
                                                <Table.DataCell align="right">
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
                        <LeggTilPeriodeButton
                            addPeriode={() =>
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
                        />
                    </>
                )}
            </InntektTabel>
        </Box>
    );
};
