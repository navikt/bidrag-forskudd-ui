import { BodyShort, Box, Heading, Table } from "@navikt/ds-react";
import React from "react";
import { useFormContext } from "react-hook-form";

import { Inntektsrapportering, Kilde, Rolletype } from "../../../api/BidragBehandlingApiV1";
import text from "../../../constants/texts";
import { KildeTexts } from "../../../enum/KildeTexts";
import { useGetBehandling } from "../../../hooks/useApiData";
import { InntektFormPeriode, InntektFormValues } from "../../../types/inntektFormValues";
import { FormControlledCheckbox } from "../../formFields/FormControlledCheckbox";
import LeggTilPeriodeButton from "../../formFields/FormLeggTilPeriode";
import { PersonNavn } from "../../PersonNavn";
import { RolleTag } from "../../RolleTag";
import { EditOrSaveButton, InntektTabel, Periode, Totalt } from "./InntektTable";

export const Kontantstøtte = () => {
    const { roller } = useGetBehandling();
    const {
        formState: { errors },
    } = useFormContext<InntektFormValues>();
    const barna = roller.filter((rolle) => rolle.rolletype === Rolletype.BA);
    const ident = roller?.find((rolle) => rolle.rolletype === Rolletype.BM)?.ident;

    return (
        <Box padding="4" background="surface-subtle" className="grid gap-y-4">
            <Heading level="3" size="medium">
                {text.title.kontantstøtte}
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
                        fieldName={`kontantstøtte.${barn.ident}` as const}
                        fieldErrors={errors?.kontantstøtte?.[barn.ident]}
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
                                                    <Table.HeaderCell scope="col" className="w-[154px]">
                                                        {text.label.beløp}
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
                                                                name={`kontantstøtte.${barn.ident}.${index}.taMed`}
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
                                                                fieldName={`kontantstøtte.${barn.ident}`}
                                                                field="datoFom"
                                                                item={item}
                                                            />
                                                        </Table.DataCell>
                                                        <Table.DataCell>
                                                            <Periode
                                                                editableRow={editableRow}
                                                                index={index}
                                                                label={text.label.tilOgMed}
                                                                fieldName={`kontantstøtte.${barn.ident}`}
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
                                                                field={`kontantstøtte.${barn.ident}.${index}`}
                                                                erRedigerbart={
                                                                    editableRow === index &&
                                                                    item.kilde === Kilde.MANUELL
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
                                            gjelderBarn: barn.ident,
                                            beløp: 0,
                                            rapporteringstype: Inntektsrapportering.KONTANTSTOTTE,
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
