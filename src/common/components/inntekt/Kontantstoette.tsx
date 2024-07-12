import { Inntektsrapportering, Kilde, Rolletype } from "@api/BidragBehandlingApiV1";
import LeggTilPeriodeButton from "@common/components/formFields/FormLeggTilPeriode";
import { PersonNavn } from "@common/components/PersonNavn";
import { RolleTag } from "@common/components/RolleTag";
import text from "@common/constants/texts";
import { useGetBehandlingV2 } from "@common/hooks/useApiData";
import { InntektFormPeriode } from "@common/types/inntektFormValues";
import { BodyShort, Box, Heading, Table } from "@navikt/ds-react";
import React from "react";

import elementId from "../../../forskudd/constants/elementIds";
import { ExpandableContent } from "./ExpandableContent";
import { EditOrSaveButton, InntektTabel, KildeIcon, Periode, TaMed, Totalt } from "./InntektTable";
import { Opplysninger } from "./Opplysninger";

export const Kontantstøtte = () => {
    const { roller } = useGetBehandlingV2();
    const barna = roller
        .filter((rolle) => rolle.rolletype === Rolletype.BA)
        .sort((a, b) => a.navn.localeCompare(b.navn));
    const bmIdent = roller?.find((rolle) => rolle.rolletype === Rolletype.BM)?.ident;

    return (
        <Box background="surface-subtle" className="grid gap-y-2 px-4 py-2">
            <Heading level="2" size="small" id={elementId.seksjon_inntekt_kontantstøtte}>
                {text.title.kontantstøtte}
            </Heading>
            <Opplysninger fieldName={"kontantstøtte"} />
            <div className="grid gap-y-[24px]">
                {barna.map((barn) => (
                    <div className="grid gap-y-2" key={barn.ident}>
                        <div className="grid grid-cols-[max-content,max-content,auto] p-2 bg-white border border-[var(--a-border-default)]">
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
                        <InntektTabel fieldName={`kontantstøtte.${barn.ident}` as const}>
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
                                                        <Table.HeaderCell
                                                            textSize="small"
                                                            scope="col"
                                                            className="w-[144px]"
                                                        >
                                                            {text.label.fraOgMed}
                                                        </Table.HeaderCell>
                                                        <Table.HeaderCell
                                                            textSize="small"
                                                            scope="col"
                                                            className="w-[144px]"
                                                        >
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
                                                        <Table.HeaderCell
                                                            scope="col"
                                                            className="w-[56px]"
                                                        ></Table.HeaderCell>
                                                        <Table.HeaderCell
                                                            scope="col"
                                                            className="w-[56px]"
                                                        ></Table.HeaderCell>
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
                                                                    fieldName={`kontantstøtte.${barn.ident}`}
                                                                    index={index}
                                                                    handleOnSelect={handleOnSelect}
                                                                />
                                                            </Table.DataCell>
                                                            <Table.DataCell textSize="small">
                                                                <Periode
                                                                    index={index}
                                                                    label={text.label.fraOgMed}
                                                                    fieldName={`kontantstøtte.${barn.ident}`}
                                                                    field="datoFom"
                                                                    item={item}
                                                                />
                                                            </Table.DataCell>
                                                            <Table.DataCell textSize="small">
                                                                <Periode
                                                                    index={index}
                                                                    label={text.label.tilOgMed}
                                                                    fieldName={`kontantstøtte.${barn.ident}`}
                                                                    field="datoTom"
                                                                    item={item}
                                                                />
                                                            </Table.DataCell>
                                                            <Table.DataCell>
                                                                <KildeIcon kilde={item.kilde} />
                                                            </Table.DataCell>
                                                            <Table.DataCell textSize="small">
                                                                <Totalt
                                                                    item={item}
                                                                    field={`kontantstøtte.${barn.ident}.${index}`}
                                                                />
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
                                                ident: bmIdent,
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
                    </div>
                ))}
            </div>
        </Box>
    );
};
