import { SackKronerFillIcon } from "@navikt/aksel-icons";
import { ObjectUtils } from "@navikt/bidrag-ui-common";
import { BodyShort, Box, Heading, HStack, Table } from "@navikt/ds-react";
import React from "react";
import { useFormContext } from "react-hook-form";

import { Inntektsrapportering, Inntektstype, Kilde } from "../../../api/BidragBehandlingApiV1";
import elementId from "../../../constants/elementIds";
import text from "../../../constants/texts";
import { useGetBehandlingV2 } from "../../../hooks/useApiData";
import { hentVisningsnavn } from "../../../hooks/useVisningsnavn";
import { InntektFormPeriode, InntektFormValues } from "../../../types/inntektFormValues";
import { FormControlledSelectField } from "../../formFields/FormControlledSelectField";
import LeggTilPeriodeButton from "../../formFields/FormLeggTilPeriode";
import AinntektLink from "./AinntektLink";
import { ExpandableContent } from "./ExpandableContent";
import HjelpetekstTabell from "./HjelpetekstTabell";
import { EditOrSaveButton, InntektTabel, KildeIcon, Periode, TaMed, Totalt } from "./InntektTable";
import { Opplysninger } from "./Opplysninger";

const Beskrivelse = ({
    item,
    field,
    erRedigerbart,
    alert,
    hjelpetekst,
}: {
    item: InntektFormPeriode;
    field: string;
    erRedigerbart: boolean;
    alert?: string;
    hjelpetekst?: string;
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
        <HStack gap={"2"}>
            <BodyShort className="leading-8 flex flex-row gap-0 align-center">
                {hentVisningsnavn(
                    item.rapporteringstype,
                    item.opprinneligFom ?? item.datoFom,
                    item.opprinneligTom ?? item.datoTom
                )}
                {alert && (
                    <p className="self-center ml-[5px] text-[var(--a-icon-info)]">
                        <SackKronerFillIcon title={alert} />
                    </p>
                )}
            </BodyShort>
            {hjelpetekst ? <HjelpetekstTabell tittel="Beskrivelse" innhold={hjelpetekst} /> : null}
        </HStack>
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

    const hjelpetekstInnhold = () => (
        <div className="">
            <ul className="list-disc pl-3">
                <li>
                    A-inntekt siste 12 mnd og 3 mnd er et ferdigberegnet gjennomsnitt av inntektsopplysninger fra de
                    siste 3 og 12 måneder omregnet til årsinntekt. Trykker man på pilen til høyre for beløpskolonnen vil
                    man se spesifiserte detaljer som perioden inntekten er beregnet ut ifra og oppsummering av de ulike
                    inntektspostene i perioden inntekten er beregnet for.
                </li>

                <li>
                    Inntektstypen overgangsstønad er beregnet som et gjennomsnitt fra mai til og med siste
                    inntektsperiode omregnet til årsinntekt.
                </li>
                <li>
                    Man kan legge inn ulike type inntektskilder slik at dette løper samtidig. Hvis en part har
                    arbeidsinntekt og ytelse skal man derfor legge inn en linje for arbeidsinntekt og en annen linje for
                    ytelse.
                </li>
                <li>
                    Hvis man skal legge inn ytelse og parten har barnetillegg, må man legge inn ytelse uten barnetillegg
                    fordi det er egen barnetilleggstabell hvor barnetillegget skal føres inn.
                </li>
                <li>
                    Hvis parten har næringsinntekt i Ligningsinntekten, vil det dukke opp et tegn for å indikere dette.
                </li>
            </ul>
        </div>
    );

    return (
        <Box padding="4" background="surface-subtle" className="grid gap-y-4">
            <div className="flex gap-x-4">
                <HStack gap={"2"}>
                    <Heading level="3" size="medium" id={elementId.seksjon_inntekt_skattepliktig}>
                        {text.title.skattepliktigeogPensjonsgivendeInntekt}
                    </Heading>
                    <HjelpetekstTabell
                        tittel="Skattepliktige og pensjonsgivende inntekter"
                        innhold={hjelpetekstInnhold()}
                    />
                </HStack>
                {årsinntekter?.length > 0 && <AinntektLink ident={ident} />}
            </div>
            <Opplysninger fieldName={fieldName} />
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
                                <Table size="small" className="table-fixed bg-white">
                                    <Table.Header>
                                        <Table.Row className="align-baseline">
                                            <Table.HeaderCell scope="col" align="left" className="w-[74px]">
                                                {text.label.taMed}
                                            </Table.HeaderCell>
                                            <Table.HeaderCell scope="col" align="left" className="w-[134px]">
                                                {text.label.fraOgMed}
                                            </Table.HeaderCell>
                                            <Table.HeaderCell scope="col" align="left" className="w-[134px]">
                                                {text.label.tilOgMed}
                                            </Table.HeaderCell>
                                            <Table.HeaderCell scope="col" align="left" className="w-[290px]">
                                                {text.label.beskrivelse}
                                            </Table.HeaderCell>
                                            <Table.HeaderCell scope="col" align="left" className="w-[54px]">
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
                                                content={
                                                    <ExpandableContent
                                                        item={item}
                                                        showInnteksposter
                                                        showLøpendeTilOgMed
                                                    />
                                                }
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
                                                        alert={
                                                            item.inntektsposter.some(
                                                                (d) =>
                                                                    d.inntektstype == Inntektstype.NAeRINGSINNTEKT ||
                                                                    d.kode.toUpperCase().includes("NAERING")
                                                            )
                                                                ? "Inntekt inneholder næringsinntekt"
                                                                : undefined
                                                        }
                                                        erRedigerbart={
                                                            editableRow === index && item.kilde === Kilde.MANUELL
                                                        }
                                                        hjelpetekst={
                                                            [
                                                                Inntektsrapportering.AINNTEKTBEREGNET12MND,
                                                                Inntektsrapportering.AINNTEKTBEREGNET3MND,
                                                            ].includes(item.rapporteringstype as Inntektsrapportering)
                                                                ? "A-inntekt siste 12 mnd og 3 mnd er et ferdigberegnet gjennomsnitt av inntektsopplysninger fra de siste 3 og 12 måneder omregnet til årsinntekt"
                                                                : undefined
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
