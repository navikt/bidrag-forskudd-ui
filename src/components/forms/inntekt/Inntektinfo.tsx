import { ExternalLink } from "@navikt/ds-icons";
import { Alert, BodyShort, Button, Heading, Label, Link, ReadMore } from "@navikt/ds-react";
import React, { Fragment, useEffect, useState } from "react";
import { FieldValues, UseFieldArrayReturn, useFormContext } from "react-hook-form";

import { GjennomsnittInntekt } from "../../../__mocks__/testdata/inntektTestData";
import { GRUNNLAG_BRUKT } from "../../../constants/error";
import { HentSkattegrunnlagResponse } from "../../../types/bidragGrunnlagTypes";
import { removePlaceholder } from "../../../utils/string-utils";

export const InntektInfo = ({
    gjennomsnittInntektSisteTreMaaneder,
    gjennomsnittInntektSisteTolvMaaneder,
    skattegrunnlager,
    inntekteneSomLeggesTilGrunnFieldArray,
}: {
    gjennomsnittInntektSisteTreMaaneder: GjennomsnittInntekt;
    gjennomsnittInntektSisteTolvMaaneder: GjennomsnittInntekt;
    skattegrunnlager: HentSkattegrunnlagResponse[];
    inntekteneSomLeggesTilGrunnFieldArray: UseFieldArrayReturn<FieldValues, "inntekteneSomLeggesTilGrunn", string>;
}) => (
    <>
        <div className="flex gap-x-2">
            <Label size="small">Gjennomsnitt inntekt siste 3 måneder (omregnet til årsinntekt):</Label>
            <BodyShort size="small">
                {gjennomsnittInntektSisteTreMaaneder.aarsInntekt}/{gjennomsnittInntektSisteTreMaaneder.maanedInntekt}
            </BodyShort>
        </div>
        <div className="flex gap-x-2">
            <Label size="small">Gjennomsnitt inntekt siste 12 måneder (omregnet til årsinntekt):</Label>
            <BodyShort size="small">
                {gjennomsnittInntektSisteTolvMaaneder.aarsInntekt}/{gjennomsnittInntektSisteTolvMaaneder.maanedInntekt}
            </BodyShort>
        </div>
        <GrunnlagInntekt skattegrunnlager={skattegrunnlager} fieldArray={inntekteneSomLeggesTilGrunnFieldArray} />
    </>
);

export const AndreTyperInntekter = ({ andreTyperInntekter }) => (
    <>
        <div className="inline-flex gap-x-4">
            <Heading level="3" size="medium">
                Andre typer inntekt
            </Heading>
            <Link href="src/components/forms#" onClick={() => {}} className="font-bold">
                A inntekt <ExternalLink aria-hidden />
            </Link>
        </div>
        <div className="grid gap-y-2">
            {andreTyperInntekter.map((inntekt, i) => (
                <div key={`${inntekt.beloep}-${i}`} className="inline-flex items-center gap-x-2">
                    <Label size="small">
                        <span className="capitalize">{inntekt.tekniskNavn}</span> ({inntekt.aar}):
                    </Label>
                    <BodyShort size="small">{inntekt.beloep}</BodyShort>
                    <ReadMore size="small" header="Detaljer">
                        Detaljer
                    </ReadMore>
                </div>
            ))}
        </div>
    </>
);

const GrunnlagInntekt = ({ skattegrunnlager, fieldArray }) => {
    const { getValues } = useFormContext();
    const [error, setError] = useState(undefined);
    const inntekteneSomLeggesTilGrunn = getValues("inntekteneSomLeggesTilGrunn");

    useEffect(() => {
        setError(undefined);
    }, [inntekteneSomLeggesTilGrunn]);

    return (
        <div className="grid grid-cols-[max-content,max-content] gap-x-4">
            <div className="grid grid-cols-[max-content,max-content] gap-x-4 items-center">
                <GrunnlagInntektOptions
                    skattegrunnlager={skattegrunnlager}
                    fieldArray={fieldArray}
                    setError={setError}
                />
            </div>
            {error && (
                <Alert variant="error" size="small" className="h-max">
                    {error}
                </Alert>
            )}
        </div>
    );
};

const GrunnlagInntektOptions = ({ skattegrunnlager, fieldArray, setError }) => {
    const { getValues } = useFormContext();

    const handleOnClicked = (grunnlag) => {
        const inntekteneSomLeggesTilGrunn = getValues("inntekteneSomLeggesTilGrunn");
        const fraDato = new Date(grunnlag.skatteoppgjoersdato);
        const tilDato = new Date(grunnlag.skatteoppgjoersdato, 12, 0);

        const periodeMedSammeInntekt = inntekteneSomLeggesTilGrunn.some(
            (inntekt) =>
                inntekt.beskrivelse === grunnlag.tekniskNavn && inntekt.fraDato <= fraDato && inntekt.tilDato >= tilDato
        );

        if (!periodeMedSammeInntekt) {
            fieldArray.append({
                fraDato,
                tilDato,
                arbeidsgiver: "",
                totalt: Number(grunnlag.beloep),
                beskrivelse: grunnlag.tekniskNavn,
                fraPostene: true,
            });
        } else {
            setError(removePlaceholder(GRUNNLAG_BRUKT, grunnlag.tekniskNavn, grunnlag.skatteoppgjoersdato));
        }
    };

    return skattegrunnlager
        .map((year) =>
            year.grunnlag.map((grunnlag) => (
                <Fragment key={`${grunnlag.tekniskNavn}-${year.skatteoppgjoersdato}-${grunnlag.beloep}`}>
                    <BodyShort size="small">
                        {grunnlag.tekniskNavn} {year.skatteoppgjoersdato}: {grunnlag.beloep}
                    </BodyShort>
                    <Button
                        type="button"
                        size="small"
                        variant="tertiary"
                        onClick={() => handleOnClicked({ ...grunnlag, skatteoppgjoersdato: year.skatteoppgjoersdato })}
                        className="w-max"
                    >
                        + legg til periode
                    </Button>
                </Fragment>
            ))
        )
        .flat();
};
