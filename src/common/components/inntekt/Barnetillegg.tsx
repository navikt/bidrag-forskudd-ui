import { Inntektsrapportering, Inntektstype, Kilde, Rolletype } from "@api/BidragBehandlingApiV1";
import { FormControlledSelectField } from "@common/components/formFields/FormControlledSelectField";
import { FormControlledTextField } from "@common/components/formFields/FormControlledTextField";
import LeggTilPeriodeButton from "@common/components/formFields/FormLeggTilPeriode";
import { PersonNavn } from "@common/components/PersonNavn";
import { RolleTag } from "@common/components/RolleTag";
import text from "@common/constants/texts";
import { useGetBehandlingV2 } from "@common/hooks/useApiData";
import { hentVisningsnavn } from "@common/hooks/useVisningsnavn";
import { InntektFormPeriode, InntektFormValues } from "@common/types/inntektFormValues";
import { ObjectUtils } from "@navikt/bidrag-ui-common";
import { BodyShort, Box, Heading, Table } from "@navikt/ds-react";
import { formatterBeløp } from "@utils/number-utils";
import React from "react";
import { useFormContext } from "react-hook-form";

import elementId from "../../constants/elementIds";
import { ExpandableContent } from "./ExpandableContent";
import { EditOrSaveButton, InntektTabel, KildeIcon, Periode, TaMed } from "./InntektTable";
import { useInntektTableProvider } from "./InntektTableContext";
import { Opplysninger } from "./Opplysninger";

const Beskrivelse = ({ item, field }: { item: InntektFormPeriode; field: string }) => {
    return item.erRedigerbart && item.kilde === Kilde.MANUELL ? (
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
        <BodyShort className="leading-8 flex align-center" size="small">
            {hentVisningsnavn(
                item.inntektstype,
                item.opprinneligFom ?? item.datoFom,
                item.opprinneligTom ?? item.datoTom
            )}
        </BodyShort>
    );
};

const Totalt = ({ item, field }: { item: InntektFormPeriode; field: string }) => (
    <>
        {item.erRedigerbart && item.kilde === Kilde.MANUELL ? (
            <FormControlledTextField
                name={`${field}.beløpMnd`}
                label="Totalt"
                type="number"
                min="1"
                inputMode="numeric"
                hideLabel
            />
        ) : (
            <div className="h-8 flex items-center justify-end">{formatterBeløp(item.beløpMnd)}</div>
        )}
    </>
);

export const Barnetillegg = () => {
    const { roller } = useGetBehandlingV2();
    const { ident } = useInntektTableProvider();
    const { getValues, clearErrors, setError } = useFormContext<InntektFormValues>();
    const barna = roller
        .filter((rolle) => rolle.rolletype === Rolletype.BA)
        .sort((a, b) => a.navn.localeCompare(b.navn));

    const customRowValidation = (fieldName: `barnetillegg.${string}.${string}.${number}`) => {
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
        <Box background="surface-subtle" className="grid gap-y-2 px-4 py-2 w-full">
            <Heading level="2" size="small" id={elementId.seksjon_inntekt_barnetillegg}>
                {text.title.barnetillegg}
            </Heading>
            <Opplysninger fieldName={`barnetillegg.${ident}.${ident}`} />
            <div className="grid gap-y-[24px]">
                {barna.map((barn) => (
                    <div className="grid gap-y-2" key={barn.ident}>
                        {barna.length > 1 && (
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
                        )}
                        <InntektTabel
                            fieldName={`barnetillegg.${ident}.${barn.ident}` as const}
                            customRowValidation={customRowValidation}
                        >
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
                                                            className="w-[134px]"
                                                        >
                                                            {text.label.fraOgMed}
                                                        </Table.HeaderCell>
                                                        <Table.HeaderCell
                                                            textSize="small"
                                                            scope="col"
                                                            className="w-[134px]"
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
                                                            className="w-[140px]"
                                                        >
                                                            {text.label.type}
                                                        </Table.HeaderCell>
                                                        <Table.HeaderCell
                                                            textSize="small"
                                                            scope="col"
                                                            align="right"
                                                            className="w-[150px]"
                                                        >
                                                            {text.label.beløpMnd}
                                                        </Table.HeaderCell>
                                                        <Table.HeaderCell
                                                            textSize="small"
                                                            scope="col"
                                                            align="right"
                                                            className="w-[150px]"
                                                        >
                                                            {text.label.beløp12Mnd}
                                                        </Table.HeaderCell>
                                                        <Table.HeaderCell
                                                            textSize="small"
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
                                                            key={item.id}
                                                            content={<ExpandableContent item={item} />}
                                                            togglePlacement="right"
                                                            className="align-top"
                                                            expansionDisabled={item.kilde === Kilde.MANUELL}
                                                        >
                                                            <Table.DataCell>
                                                                <TaMed
                                                                    fieldName={`barnetillegg.${ident}.${barn.ident}`}
                                                                    index={index}
                                                                    handleOnSelect={handleOnSelect}
                                                                />
                                                            </Table.DataCell>
                                                            <Table.DataCell textSize="small">
                                                                <Periode
                                                                    index={index}
                                                                    label={text.label.fraOgMed}
                                                                    fieldName={`barnetillegg.${ident}.${barn.ident}`}
                                                                    field="datoFom"
                                                                    item={item}
                                                                />
                                                            </Table.DataCell>
                                                            <Table.DataCell textSize="small">
                                                                <Periode
                                                                    index={index}
                                                                    label={text.label.tilOgMed}
                                                                    fieldName={`barnetillegg.${ident}.${barn.ident}`}
                                                                    field="datoTom"
                                                                    item={item}
                                                                />
                                                            </Table.DataCell>
                                                            <Table.DataCell>
                                                                <KildeIcon kilde={item.kilde} />
                                                            </Table.DataCell>
                                                            <Table.DataCell textSize="small">
                                                                <Beskrivelse
                                                                    item={item}
                                                                    field={`barnetillegg.${ident}.${barn.ident}.${index}`}
                                                                />
                                                            </Table.DataCell>
                                                            <Table.DataCell textSize="small">
                                                                <Totalt
                                                                    item={item}
                                                                    field={`barnetillegg.${ident}.${barn.ident}.${index}`}
                                                                />
                                                            </Table.DataCell>
                                                            <Table.DataCell textSize="small">
                                                                <div className="h-8 flex items-center justify-end">
                                                                    {formatterBeløp(item.beløpMnd * 12)}
                                                                </div>
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
                                        addPeriode={() => {
                                            addPeriod({
                                                ident,
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
                    </div>
                ))}
            </div>
        </Box>
    );
};
