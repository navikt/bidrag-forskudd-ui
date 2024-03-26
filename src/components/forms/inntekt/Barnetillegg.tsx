import { ObjectUtils } from "@navikt/bidrag-ui-common";
import { BodyShort, Box, Heading, Table } from "@navikt/ds-react";
import React from "react";
import { useFormContext } from "react-hook-form";

import { Inntektsrapportering, Inntektstype, Kilde, Rolletype } from "../../../api/BidragBehandlingApiV1";
import text from "../../../constants/texts";
import { useGetBehandlingV2 } from "../../../hooks/useApiData";
import { hentVisningsnavn } from "../../../hooks/useVisningsnavn";
import { InntektFormPeriode, InntektFormValues } from "../../../types/inntektFormValues";
import { getYearFromDate } from "../../../utils/date-utils";
import { FormControlledSelectField } from "../../formFields/FormControlledSelectField";
import { FormControlledTextField } from "../../formFields/FormControlledTextField";
import LeggTilPeriodeButton from "../../formFields/FormLeggTilPeriode";
import { PersonNavn } from "../../PersonNavn";
import { RolleTag } from "../../RolleTag";
import { EditOrSaveButton, InntektTabel, KildeIcon, Periode, TaMed } from "./InntektTable";

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
            name={`${field}.inntektstype`}
            label={text.label.beskrivelse}
            options={[{ value: "", text: text.select.inntektPlaceholder }].concat(
                Object.entries(Inntektstype)
                    .filter(([, text]) => text.includes("BARNETILLEGG"))
                    .map(([value, text]) => ({
                        value: Inntektstype[value],
                        text: hentVisningsnavn(text),
                    }))
            )}
            hideLabel
        />
    ) : (
        <BodyShort className="capitalize leading-8">
            {hentVisningsnavn(item.inntektstype, getYearFromDate(item.datoFom))}
        </BodyShort>
    );
};

const Totalt = ({
    item,
    field,
    erRedigerbart,
}: {
    item: InntektFormPeriode;
    field: string;
    erRedigerbart: boolean;
}) => (
    <>
        {erRedigerbart ? (
            <FormControlledTextField
                name={`${field}.beløpMnd`}
                label="Totalt"
                type="number"
                min="1"
                inputMode="numeric"
                hideLabel
            />
        ) : (
            <div className="h-8 flex items-center justify-end">
                <BodyShort>{item.beløpMnd.toLocaleString("nb-NO")}</BodyShort>
            </div>
        )}
    </>
);

export const Barnetillegg = () => {
    const { roller } = useGetBehandlingV2();
    const { getValues, clearErrors, setError } = useFormContext<InntektFormValues>();
    const barna = roller
        .filter((rolle) => rolle.rolletype === Rolletype.BA)
        .sort((a, b) => a.navn.localeCompare(b.navn));
    const bmIdent = roller?.find((rolle) => rolle.rolletype === Rolletype.BM)?.ident;

    const customRowValidation = (fieldName: `barnetillegg.${string}.${number}`) => {
        const periode = getValues(fieldName);
        if (ObjectUtils.isEmpty(periode.inntektstype)) {
            setError(`${fieldName}.inntektstype`, {
                type: "notValid",
                message: text.error.barnetilleggType,
            });
        } else {
            clearErrors(`${fieldName}.inntektstype`);
        }
    };

    return (
        <Box padding="4" background="surface-subtle" className="grid gap-y-4">
            <Heading level="3" size="medium">
                {text.title.barnetillegg}
            </Heading>
            {barna.map((barn) => (
                <React.Fragment key={barn.ident}>
                    <div className="grid grid-cols-[max-content,max-content,auto] mb-2 p-2 bg-[#EFECF4]">
                        <div className="w-8 mr-2 h-max">
                            <RolleTag rolleType={Rolletype.BA} />
                        </div>
                        <div className="flex items-center gap-4">
                            <BodyShort size="small" className="font-bold">
                                <PersonNavn ident={barn.ident}></PersonNavn>
                            </BodyShort>
                            <BodyShort size="small">{barn.ident}</BodyShort>
                        </div>
                    </div>
                    <InntektTabel
                        fieldName={`barnetillegg.${barn.ident}` as const}
                        customRowValidation={customRowValidation}
                    >
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
                                                    <Table.HeaderCell scope="col" align="center" className="w-[74px]">
                                                        {text.label.taMed}
                                                    </Table.HeaderCell>
                                                    <Table.HeaderCell scope="col" className="w-[134px]">
                                                        {text.label.fraOgMed}
                                                    </Table.HeaderCell>
                                                    <Table.HeaderCell scope="col" className="w-[134px]">
                                                        {text.label.tilOgMed}
                                                    </Table.HeaderCell>
                                                    <Table.HeaderCell scope="col" align="center" className="w-[74px]">
                                                        {text.label.kilde}
                                                    </Table.HeaderCell>
                                                    <Table.HeaderCell scope="col" className="w-[204px]">
                                                        {text.label.type}
                                                    </Table.HeaderCell>
                                                    <Table.HeaderCell scope="col" align="right" className="w-[130px]">
                                                        {text.label.beløpMnd}
                                                    </Table.HeaderCell>
                                                    <Table.HeaderCell scope="col" align="right" className="w-[134px]">
                                                        {text.label.beløp12Mnd}
                                                    </Table.HeaderCell>
                                                    <Table.HeaderCell
                                                        scope="col"
                                                        className="w-[56px]"
                                                    ></Table.HeaderCell>
                                                </Table.Row>
                                            </Table.Header>
                                            <Table.Body>
                                                {controlledFields.map((item, index) => (
                                                    <Table.Row key={item.ident + index} className="align-top">
                                                        <Table.DataCell>
                                                            <TaMed
                                                                key={item?.id + index}
                                                                fieldName={`barnetillegg.${barn.ident}`}
                                                                index={index}
                                                                handleOnSelect={handleOnSelect}
                                                            />
                                                        </Table.DataCell>
                                                        <Table.DataCell>
                                                            <Periode
                                                                key={item?.id + index}
                                                                editableRow={editableRow}
                                                                index={index}
                                                                label={text.label.fraOgMed}
                                                                fieldName={`barnetillegg.${barn.ident}`}
                                                                field="datoFom"
                                                                item={item}
                                                            />
                                                        </Table.DataCell>
                                                        <Table.DataCell>
                                                            <Periode
                                                                key={item?.id + index}
                                                                editableRow={editableRow}
                                                                index={index}
                                                                label={text.label.tilOgMed}
                                                                fieldName={`barnetillegg.${barn.ident}`}
                                                                field="datoTom"
                                                                item={item}
                                                            />
                                                        </Table.DataCell>
                                                        <Table.DataCell>
                                                            <KildeIcon key={item?.id + index} kilde={item.kilde} />
                                                        </Table.DataCell>
                                                        <Table.DataCell>
                                                            <Beskrivelse
                                                                key={item?.id + index}
                                                                item={item}
                                                                field={`barnetillegg.${barn.ident}.${index}`}
                                                                erRedigerbart={
                                                                    editableRow === index &&
                                                                    item.kilde === Kilde.MANUELL
                                                                }
                                                            />
                                                        </Table.DataCell>
                                                        <Table.DataCell>
                                                            <Totalt
                                                                key={item?.id + index}
                                                                item={item}
                                                                field={`barnetillegg.${barn.ident}.${index}`}
                                                                erRedigerbart={
                                                                    editableRow === index &&
                                                                    item.kilde === Kilde.MANUELL
                                                                }
                                                            />
                                                        </Table.DataCell>
                                                        <Table.DataCell>
                                                            <div className="h-8 flex items-center justify-end">
                                                                <BodyShort key={item?.id + index}>
                                                                    {(item.beløpMnd * 12).toLocaleString("nb-NO")}
                                                                </BodyShort>
                                                            </div>
                                                        </Table.DataCell>
                                                        <Table.DataCell>
                                                            <EditOrSaveButton
                                                                key={item?.id + index}
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
                                    addPeriode={() => {
                                        addPeriod({
                                            ident: bmIdent,
                                            datoFom: null,
                                            datoTom: null,
                                            gjelderBarn: barn.ident,
                                            beløp: 0,
                                            beløpMnd: 0,
                                            rapporteringstype: Inntektsrapportering.BARNETILLEGG,
                                            taMed: true,
                                            kilde: Kilde.MANUELL,
                                            inntektsposter: [],
                                            inntektstyper: [],
                                        });
                                    }}
                                />
                            </>
                        )}
                    </InntektTabel>
                </React.Fragment>
            ))}
        </Box>
    );
};
