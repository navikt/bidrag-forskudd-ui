import { BodyShort, Box, Heading, Table } from "@navikt/ds-react";
import React from "react";
import { useFormContext } from "react-hook-form";

import { Inntektsrapportering, Inntektstype, Kilde, Rolletype } from "../../../api/BidragBehandlingApiV1";
import text from "../../../constants/texts";
import { KildeTexts } from "../../../enum/KildeTexts";
import { useGetBehandlingV2 } from "../../../hooks/useApiData";
import { hentVisningsnavn } from "../../../hooks/useVisningsnavn";
import { InntektFormPeriode, InntektFormValues } from "../../../types/inntektFormValues";
import { getYearFromDate } from "../../../utils/date-utils";
import { FormControlledCheckbox } from "../../formFields/FormControlledCheckbox";
import { FormControlledSelectField } from "../../formFields/FormControlledSelectField";
import LeggTilPeriodeButton from "../../formFields/FormLeggTilPeriode";
import { PersonNavn } from "../../PersonNavn";
import { RolleTag } from "../../RolleTag";
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
            name={`${field}.inntektstype`}
            label={text.label.beskrivelse}
            options={[{ value: "", text: text.select.inntektPlaceholder }].concat(
                Object.entries(Inntektstype)
                    .filter(([, text]) => text.includes("BARNETILLEGG"))
                    .map(([value, text]) => ({
                        value,
                        text: hentVisningsnavn(text),
                    }))
            )}
            hideLabel
        />
    ) : (
        <BodyShort className="min-w-[215px] capitalize">
            {hentVisningsnavn(item.inntektstyper[0], getYearFromDate(item.datoFom))}
        </BodyShort>
    );
};

export const Barnetillegg = () => {
    const { roller } = useGetBehandlingV2();
    const barna = roller.filter((rolle) => rolle.rolletype === Rolletype.BA);
    const {
        formState: { errors },
    } = useFormContext<InntektFormValues>();
    const ident = roller?.find((rolle) => rolle.rolletype === Rolletype.BM)?.ident;

    return (
        <Box padding="4" background="surface-subtle" className="grid gap-y-4">
            <Heading level="3" size="medium">
                Barnetillegg
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
                        fieldErrors={errors?.barnetillegg?.[barn.ident]}
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
                                        <Table size="small">
                                            <Table.Header>
                                                <Table.Row className="align-baseline">
                                                    <Table.HeaderCell scope="col" className="w-[84px]">
                                                        {text.label.taMed}
                                                    </Table.HeaderCell>
                                                    <Table.HeaderCell scope="col" className="w-[145px]">
                                                        {text.label.fraOgMed}
                                                    </Table.HeaderCell>
                                                    <Table.HeaderCell scope="col" className="w-[145px]">
                                                        {text.label.tilOgMed}
                                                    </Table.HeaderCell>
                                                    <Table.HeaderCell scope="col">{text.label.kilde}</Table.HeaderCell>
                                                    <Table.HeaderCell scope="col">{text.label.type}</Table.HeaderCell>
                                                    <Table.HeaderCell scope="col" className="w-[154px]">
                                                        {text.label.beløpMnd}
                                                    </Table.HeaderCell>
                                                    <Table.HeaderCell scope="col" className="w-[154px]">
                                                        {text.label.beløp12Mnd}
                                                    </Table.HeaderCell>
                                                    <Table.HeaderCell scope="col"></Table.HeaderCell>
                                                    <Table.HeaderCell scope="col"></Table.HeaderCell>
                                                </Table.Row>
                                            </Table.Header>
                                            <Table.Body>
                                                {controlledFields.map((item, index) => (
                                                    <Table.Row
                                                        key={item.ident + index}
                                                        className="h-[41px] align-baseline"
                                                    >
                                                        <Table.DataCell className="w-[84px]" align="center">
                                                            <FormControlledCheckbox
                                                                className="w-full flex justify-center"
                                                                name={`barnetillegg.${barn.ident}.${index}.taMed`}
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
                                                                label={text.label.fraOgMed}
                                                                fieldName={`barnetillegg.${barn.ident}`}
                                                                field="datoFom"
                                                                item={item}
                                                            />
                                                        </Table.DataCell>
                                                        <Table.DataCell>
                                                            <Periode
                                                                editableRow={editableRow}
                                                                index={index}
                                                                label={text.label.tilOgMed}
                                                                fieldName={`barnetillegg.${barn.ident}`}
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
                                                            <Beskrivelse
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
                                                                item={item}
                                                                field={`barnetillegg.${barn.ident}.${index}`}
                                                                erRedigerbart={
                                                                    editableRow === index &&
                                                                    item.kilde === Kilde.MANUELL
                                                                }
                                                            />
                                                        </Table.DataCell>
                                                        <Table.DataCell>
                                                            <BodyShort className="min-w-[80px]">
                                                                {item.beløp * 12}
                                                            </BodyShort>
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
                                            gjelderBarn: barn.ident,
                                            beløp: 0,
                                            rapporteringstype: Inntektsrapportering.BARNETILLEGG,
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
                </React.Fragment>
            ))}
        </Box>
    );
};
