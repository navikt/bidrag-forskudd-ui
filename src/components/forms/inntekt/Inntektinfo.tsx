import { ExternalLink } from "@navikt/ds-icons";
import { BodyShort, Heading, Label, Link, ReadMore } from "@navikt/ds-react";
import React from "react";
import { FieldValues, UseFieldArrayReturn } from "react-hook-form";

import { GjennomsnittInntekt } from "../../../__mocks__/testdata/inntektTestData";
import { HentSkattegrunnlagResponse } from "../../../types/bidragGrunnlagTypes";
import { FormControlledCheckbox } from "../../formFields/FormControlledCheckbox";
import { createSkattegrunlagIdent } from "./inntektFormHelpers";

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
            <Label size="small">Gjennomsnitt Inntekt siste 3 måneder (omregnet til årsinntekt):</Label>
            <BodyShort size="small">
                {gjennomsnittInntektSisteTreMaaneder.aarsInntekt}/{gjennomsnittInntektSisteTreMaaneder.maanedInntekt}
            </BodyShort>
        </div>
        <div className="flex gap-x-2">
            <Label size="small">Gjennomsnitt Inntekt siste 12 måneder (omregnet til årsinntekt):</Label>
            <BodyShort size="small">
                {gjennomsnittInntektSisteTolvMaaneder.aarsInntekt}/{gjennomsnittInntektSisteTolvMaaneder.maanedInntekt}
            </BodyShort>
        </div>
        <GrunnlagInntektOptions
            skattegrunnlager={skattegrunnlager}
            fieldArray={inntekteneSomLeggesTilGrunnFieldArray}
        />
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

const GrunnlagInntektOptions = ({ skattegrunnlager, fieldArray }) => {
    const handleOnChange = (checked, grunnlagValues) => {
        const ident = createSkattegrunlagIdent(grunnlagValues.skatteoppgjoersdato, grunnlagValues.tekniskNavn);
        if (checked) {
            fieldArray.append({
                fraDato: new Date(grunnlagValues.skatteoppgjoersdato),
                tilDato: new Date(grunnlagValues.skatteoppgjoersdato, 12, 0),
                arbeidsgiver: "",
                totalt: Number(grunnlagValues.beloep),
                beskrivelse: grunnlagValues.tekniskNavn,
                ident,
            });
        } else {
            const index = fieldArray.fields.findIndex((field) => field.ident === ident);
            if (index !== -1) fieldArray.remove(index);
        }
    };

    return skattegrunnlager
        .map((year) =>
            year.grunnlag.map((grunnlag) => (
                <FormControlledCheckbox
                    onChange={(e) =>
                        handleOnChange(e.target.checked, { ...grunnlag, skatteoppgjoersdato: year.skatteoppgjoersdato })
                    }
                    key={`${year.skatteoppgjoersdato}-${grunnlag.tekniskNavn}`}
                    name={createSkattegrunlagIdent(year.skatteoppgjoersdato, grunnlag.tekniskNavn)}
                    legend={`${grunnlag.tekniskNavn} ${year.skatteoppgjoersdato}: ${grunnlag.beloep}`}
                />
            ))
        )
        .flat();
};
