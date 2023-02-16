import { Edit, ExternalLink } from "@navikt/ds-icons";
import {
    BodyShort,
    Button,
    Checkbox,
    CheckboxGroup,
    Heading,
    Label,
    Link,
    ReadMore,
    Textarea,
    TextField,
} from "@navikt/ds-react";
import React from "react";

import { useForskudd } from "../../context/ForskuddContext";
import { CommonFormProps } from "../../pages/forskudd/ForskuddPage";
import { DatePickerModal } from "../date-picker/DatePickerModal";
import { FlexRow } from "../layout/grid/FlexRow";

export const Inntekt = ({ setActiveStep }: CommonFormProps) => {
    const { skattegrunnlager } = useForskudd();
    return (
        <div className="grid gap-y-8">
            <div className="grid gap-y-4">
                <Heading level="2" size="xlarge">
                    Inntekt
                </Heading>
                <div className="grid gap-y-2">
                    <div className="flex">
                        <Label size="small">Periode: </Label>
                        <span className="w-52"></span>
                        <DatePickerModal
                            button={(datePickerButtonProps) => (
                                <Button
                                    onClick={datePickerButtonProps.onClick}
                                    icon={<Edit aria-hidden />}
                                    variant="tertiary"
                                    size="xsmall"
                                >
                                    Rediger
                                </Button>
                            )}
                        />
                    </div>
                    <div>
                        <Label size="small">Gjennomsnitt Inntekt siste 3 måneder (omregnet til årsinntekt):</Label>
                    </div>
                    <div>
                        <Label size="small">Gjennomsnitt Inntekt siste 12 måneder (omregnet til årsinntekt):</Label>
                    </div>
                    {skattegrunnlager?.map((skattegrunnlag) => (
                        <div key={skattegrunnlag.skatteoppgjoersdato} className="flex gap-x-2">
                            <Label size="small">Skattegrunnlag ({skattegrunnlag.skatteoppgjoersdato}):</Label>
                            {skattegrunnlag.grunnlag.map((grunnlag) => (
                                <BodyShort key={skattegrunnlag.skatteoppgjoersdato + grunnlag.beloep} size="small">
                                    {grunnlag.beloep}
                                </BodyShort>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            <div className="grid gap-y-4">
                <div className="inline-flex gap-x-4">
                    <Heading level="3" size="medium">
                        Andre typer inntekt
                    </Heading>
                    <Link href="#" onClick={() => {}} className="font-bold">
                        A inntekt <ExternalLink aria-hidden />
                    </Link>
                </div>
                <div className="grid gap-y-2">
                    <div className="inline-flex items-center gap-x-2">
                        <Label size="small">Kapitalinntekt (2020):</Label>
                        <ReadMore size="small" header="Detaljer">
                            Detaljer
                        </ReadMore>
                    </div>
                    <div className="inline-flex items-center gap-x-2">
                        <Label size="small">Næringsinntekt (2020):</Label>
                        <ReadMore size="small" header="Detaljer">
                            Detaljer
                        </ReadMore>
                    </div>
                </div>
            </div>
            <div className="grid gap-y-4">
                <Heading level="3" size="medium">
                    Arbeidsforhold
                </Heading>
                <div className="grid gap-y-2">
                    <div className="inline-flex items-center gap-x-4">
                        <Label size="small">Nåværende arbeidsforhold</Label>
                        <Link href="#" onClick={() => {}} className="font-bold">
                            AA-register <ExternalLink aria-hidden />
                        </Link>
                    </div>
                    <FlexRow>
                        <div>
                            <Label size="small">Periode</Label>
                        </div>
                        <div>
                            <Label size="small">Arbeidsgiver</Label>
                        </div>
                        <div>
                            <Label size="small">Stilling</Label>
                        </div>
                        <div>
                            <Label size="small">Lønnsendring</Label>
                        </div>
                    </FlexRow>
                </div>
            </div>
            <div className="grid gap-y-4">
                <Heading level="3" size="medium">
                    Perioder
                </Heading>
                <FlexRow>
                    <div>
                        <Label size="small">Fra og med</Label>
                    </div>
                    <div>
                        <Label size="small">Til og med</Label>
                    </div>
                    <div>
                        <Label size="small">Arbeidsgiver/Nav</Label>
                    </div>
                    <div>
                        <Label size="small">Inntekt</Label>
                    </div>
                    <div>
                        <Label size="small">Tillegg</Label>
                    </div>
                    <div>
                        <Label size="small">Totalt</Label>
                    </div>
                    <div>
                        <Label size="small">Beskrivelse</Label>
                    </div>
                </FlexRow>
            </div>
            <div className="grid gap-y-4">
                <Heading level="3" size="medium">
                    Utvidet barnetrygd
                </Heading>
                <FlexRow>
                    <div>
                        <Label size="small">Periode</Label>
                    </div>
                    <div>
                        <Label size="small">Delt bosted</Label>
                    </div>
                    <div>
                        <Label size="small">Beløp</Label>
                    </div>
                </FlexRow>
            </div>
            <div className="grid gap-y-4">
                <Heading level="3" size="medium">
                    Kontantstøtte (for hele året/ per barn)
                </Heading>
                <FlexRow>
                    <div>
                        <Label size="small">Periode</Label>
                    </div>
                    <div>
                        <Label size="small">Barn</Label>
                    </div>
                </FlexRow>
            </div>
            <div className="grid gap-y-4">
                <Heading level="3" size="medium">
                    Barnetillegg (for bidragsbarnet, per måned i tillegg til inntekter)
                </Heading>
                <FlexRow>
                    <div>
                        <Label size="small">Fra og med</Label>
                    </div>
                    <div>
                        <Label size="small">Til og med</Label>
                    </div>
                    <div>
                        <Label size="small">Barn</Label>
                    </div>
                    <div>
                        <Label size="small">Barnetillegg (brutto)</Label>
                    </div>
                    <div>
                        <Label size="small">Skattesats</Label>
                    </div>
                    <div>
                        <Label size="small">Barnetillegg (netto)</Label>
                    </div>
                </FlexRow>
            </div>
            <div className="grid gap-y-4">
                <Heading level="3" size="medium">
                    Kommentar
                </Heading>
                <div>
                    <Textarea label="Begrunnelse (med i vedtaket og notat)" size="small" />
                </div>
                <div>
                    <TextField label="Begrunnelse (kun med i notat)" size="small" />
                </div>
                <div>
                    <CheckboxGroup
                        legend="Skal til to-trinns kontroll."
                        hideLegend
                        onChange={(val: any[]) => console.log(val)}
                        size="small"
                    >
                        <Checkbox value="true">Skal til to-trinns kontroll.</Checkbox>
                    </CheckboxGroup>
                </div>
            </div>
            <FlexRow>
                <Button loading={false} onClick={() => {}} className="w-max" size="small">
                    Gå videre
                </Button>
                <Button loading={false} variant="secondary" onClick={() => {}} className="w-max" size="small">
                    Oppfrisk
                </Button>
                <Button loading={false} variant="secondary" onClick={() => {}} className="w-max" size="small">
                    Lagre
                </Button>
                <Link href="#" onClick={() => {}} className="font-bold">
                    Vis notat <ExternalLink aria-hidden />
                </Link>
            </FlexRow>
        </div>
    );
};
