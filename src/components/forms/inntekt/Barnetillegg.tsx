import { BodyShort, Box, Heading, Table } from "@navikt/ds-react";
import React from "react";

import { Inntektsrapportering, Inntektstype, Kilde, Rolletype } from "../../../api/BidragBehandlingApiV1";
import text from "../../../constants/texts";
import { useGetBehandlingV2 } from "../../../hooks/useApiData";
import { hentVisningsnavn } from "../../../hooks/useVisningsnavn";
import { InntektFormPeriode } from "../../../types/inntektFormValues";
import { getYearFromDate } from "../../../utils/date-utils";
import { FormControlledSelectField } from "../../formFields/FormControlledSelectField";
import LeggTilPeriodeButton from "../../formFields/FormLeggTilPeriode";
import { PersonNavn } from "../../PersonNavn";
import { RolleTag } from "../../RolleTag";
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
        <BodyShort className="capitalize leading-8">
            {hentVisningsnavn(item.inntektstyper[0], getYearFromDate(item.datoFom))}
        </BodyShort>
    );
};

export const Barnetillegg = () => {
    const { roller } = useGetBehandlingV2();
    const barna = roller.filter((rolle) => rolle.rolletype === Rolletype.BA);
    const ident = roller?.find((rolle) => rolle.rolletype === Rolletype.BM)?.ident;

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
                    <InntektTabel fieldName={`barnetillegg.${barn.ident}` as const}>
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
                                                    <Table.HeaderCell scope="col" className="w-[252px]">
                                                        {text.label.type}
                                                    </Table.HeaderCell>
                                                    <Table.HeaderCell scope="col" align="right" className="w-[154px]">
                                                        {text.label.beløpMnd}
                                                    </Table.HeaderCell>
                                                    <Table.HeaderCell scope="col" align="right" className="w-[154px]">
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
                                                                fieldName={`barnetillegg.${barn.ident}`}
                                                                index={index}
                                                                handleOnSelect={handleOnSelect}
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
                                                            <KildeIcon kilde={item.kilde} />
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
                                                            <div className="h-8 flex items-center justify-end">
                                                                <BodyShort>
                                                                    {(item.beløp * 12).toLocaleString("nb-NO")}
                                                                </BodyShort>
                                                            </div>
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
