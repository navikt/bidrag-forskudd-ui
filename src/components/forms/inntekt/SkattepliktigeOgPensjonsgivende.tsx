import { SackKronerFillIcon } from "@navikt/aksel-icons";
import { ObjectUtils } from "@navikt/bidrag-ui-common";
import { BodyShort, Box, Heading, HStack, ReadMore, Switch, Table, VStack } from "@navikt/ds-react";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useFormContext } from "react-hook-form";

import { Inntektsrapportering, Inntektstype, Kilde } from "../../../api/BidragBehandlingApiV1";
import elementId from "../../../constants/elementIds";
import text from "../../../constants/texts";
import { useForskudd } from "../../../context/ForskuddContext";
import { QueryKeys, useGetBehandlingV2 } from "../../../hooks/useApiData";
import { hentVisningsnavn } from "../../../hooks/useVisningsnavn";
import { InntektFormPeriode, InntektFormValues } from "../../../types/inntektFormValues";
import { FormControlledSelectField } from "../../formFields/FormControlledSelectField";
import LeggTilPeriodeButton from "../../formFields/FormLeggTilPeriode";
import AinntektLink from "./AinntektLink";
import { ExpandableContent } from "./ExpandableContent";
import { EditOrSaveButton, InntektTabel, KildeIcon, Periode, TaMed, Totalt } from "./InntektTable";
import { Opplysninger } from "./Opplysninger";

const Beskrivelse = ({ item, field, alert }: { item: InntektFormPeriode; field: string; alert?: string }) => {
    return item.erRedigerbart && item.kilde === Kilde.MANUELL ? (
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
        <BodyShort className="leading-8 flex flex-row gap-0 align-center" size="small">
            {hentVisningsnavn(
                item.rapporteringstype,
                item.opprinneligFom ?? item.datoFom,
                item.opprinneligTom ?? item.datoTom
            )}
            {alert && (
                <span className="self-center ml-[5px] text-[var(--a-icon-info)]">
                    <SackKronerFillIcon title={alert} />
                </span>
            )}
        </BodyShort>
    );
};

export const SkattepliktigeOgPensjonsgivende = ({ ident }: { ident: string }) => {
    const { inntekter, id } = useGetBehandlingV2();
    const queryClient = useQueryClient();
    const { visHistoriskeInntekter, setVisHistoriskeInntekter } = useForskudd();
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
        <div>
            <ul className="list-disc pl-3">
                <li>
                    Her skal man legge inn den skattepliktige og pensjonsgivende inntekten parten har. Denne tabellen må
                    være fylt ut for at man skal kunne fatte vedtak.
                </li>
                <li>
                    A-inntekt siste 12 mnd og 3 mnd er et ferdigberegnet gjennomsnitt av inntektsopplysninger fra de
                    siste 3 og 12 måneder omregnet til årsinntekt. Trykker man på pilen til høyre for beløpskolonnen vil
                    man se spesifiserte detaljer som perioden inntekten er beregnet ut ifra og oppsummering av de ulike
                    inntektspostene i perioden inntekten er beregnet for.
                </li>

                <li>
                    Når man passerer den 05. i hver måned vil de automatisk beregnede inntektsopplysningene fra
                    a-inntekt oppdatere seg slik at man får med inntekt for forrige måned. Dette er for å ha de nyeste
                    opplysningene ved beregningen av disse inntektstypene. Man vil da få en melding som viser hvilke
                    inntektstyper som oppdateres og man må trykke på "oppdater opplysninger".
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
                <li className="flex flex-row gap-1 items-center">
                    Hvis parten har næringsinntekt i Ligningsinntekten, vil det vises en <SackKronerFillIcon /> ikon ved
                    siden av beskrivelsen for å indikere dette.
                </li>
            </ul>
        </div>
    );

    return (
        <Box background="surface-subtle" className="grid gap-y-2 px-4 py-2">
            <div className="flex gap-x-4">
                <VStack gap={"2"}>
                    <HStack gap={"2"}>
                        <Heading level="2" size="small" id={elementId.seksjon_inntekt_skattepliktig}>
                            {text.title.skattepliktigeogPensjonsgivendeInntekt}
                        </Heading>

                        {årsinntekter?.length > 0 && <AinntektLink ident={ident} />}
                    </HStack>
                    <ReadMore size="small" header="Brukerveiledning">
                        {hjelpetekstInnhold()}
                    </ReadMore>
                </VStack>
            </div>
            <Opplysninger fieldName={fieldName} ident={ident} />
            <Switch
                value={"true"}
                checked={visHistoriskeInntekter}
                onChange={(e) => {
                    console.log(e.target.value, e.target.value == "true", visHistoriskeInntekter);
                    setVisHistoriskeInntekter((v) => !v);
                    queryClient.refetchQueries({ queryKey: QueryKeys.behandlingV2(id) });
                }}
                size="small"
            >
                Vis historiske
            </Switch>
            <InntektTabel fieldName={fieldName} customRowValidation={customRowValidation}>
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
                                                align="left"
                                                className="w-[74px]"
                                            >
                                                {text.label.taMed}
                                            </Table.HeaderCell>
                                            <Table.HeaderCell
                                                textSize="small"
                                                scope="col"
                                                align="left"
                                                className="w-[134px]"
                                            >
                                                {text.label.fraOgMed}
                                            </Table.HeaderCell>
                                            <Table.HeaderCell
                                                textSize="small"
                                                scope="col"
                                                align="left"
                                                className="w-[134px]"
                                            >
                                                {text.label.tilOgMed}
                                            </Table.HeaderCell>
                                            <Table.HeaderCell
                                                textSize="small"
                                                scope="col"
                                                align="left"
                                                className="w-[290px]"
                                            >
                                                {text.label.beskrivelse}
                                            </Table.HeaderCell>
                                            <Table.HeaderCell
                                                textSize="small"
                                                scope="col"
                                                align="left"
                                                className="w-[54px]"
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
                                            <Table.HeaderCell scope="col" className="w-[56px]"></Table.HeaderCell>
                                            <Table.HeaderCell scope="col" className="w-[56px]"></Table.HeaderCell>
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
                                                <Table.DataCell textSize="small">
                                                    <Periode
                                                        index={index}
                                                        label={text.label.fraOgMed}
                                                        fieldName={fieldName}
                                                        field="datoFom"
                                                        item={item}
                                                    />
                                                </Table.DataCell>
                                                <Table.DataCell textSize="small">
                                                    <Periode
                                                        index={index}
                                                        label={text.label.tilOgMed}
                                                        fieldName={fieldName}
                                                        field="datoTom"
                                                        item={item}
                                                    />
                                                </Table.DataCell>
                                                <Table.DataCell textSize="small">
                                                    <Beskrivelse
                                                        item={item}
                                                        field={`${fieldName}.${index}`}
                                                        alert={
                                                            item.inntektsposter?.some(
                                                                (d) =>
                                                                    d.inntektstype == Inntektstype.NAeRINGSINNTEKT ||
                                                                    d.kode.toUpperCase().includes("NAERING")
                                                            )
                                                                ? "Inntekt inneholder næringsinntekt"
                                                                : undefined
                                                        }
                                                    />
                                                </Table.DataCell>
                                                <Table.DataCell>
                                                    <KildeIcon kilde={item.kilde} />
                                                </Table.DataCell>
                                                <Table.DataCell align="right" textSize="small">
                                                    <Totalt item={item} field={`${fieldName}.${index}`} />
                                                </Table.DataCell>
                                                <Table.DataCell textSize="small">
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
