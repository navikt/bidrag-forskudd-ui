import { Edit, ExternalLink } from "@navikt/ds-icons";
import { Button, Checkbox, CheckboxGroup, Heading, Label, Link, Textarea, TextField } from "@navikt/ds-react";
import React from "react";

import { CommonFormProps } from "../../pages/forskudd/ForskuddPage";
import { DatePickerModal } from "../date-picker/DatePickerModal";

export default function Inntekt({ setActiveStep }: CommonFormProps) {
    return (
        <div>
            <Heading level="2" size="large">
                Inntekt
            </Heading>
            <div className="mt-4">
                <div className="flex">
                    <Label>Periode: </Label>
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
                    <Label>Gjennomsnitt Inntekt siste 3 måneder (omregnet til årsinntekt):</Label>
                </div>
                <div>
                    <Label>Gjennomsnitt Inntekt siste 12 måneder (omregnet til årsinntekt):</Label>
                </div>
                <div>
                    <Label>Skattegrunnlag (2020):</Label>
                </div>
                <div>
                    <Label>Andre typer inntekt</Label>
                    <Link href="#" onClick={() => {}} className="font-bold">
                        A inntekt <ExternalLink aria-hidden />
                    </Link>
                    <Label>Kapitalinntekt (2020):</Label>
                    <Label>Næringsinntekt (2020):</Label>
                </div>
                <div>
                    <Label>Arbeidsforhold</Label>
                    <Label>Nåværende arbeidsforhold</Label>
                    <Link href="#" onClick={() => {}} className="font-bold">
                        AA-register <ExternalLink aria-hidden />
                    </Link>
                    <div>
                        <Label>Periode</Label>
                    </div>
                    <div>
                        <Label>Arbeidsgiver</Label>
                    </div>
                    <div>
                        <Label>Stilling</Label>
                    </div>
                    <div>
                        <Label>Lønnsendring</Label>
                    </div>
                </div>
                <div>
                    <Label>Perioder</Label>
                    <div>
                        <Label>Fra og med</Label>
                    </div>
                    <div>
                        <Label>Til og med</Label>
                    </div>
                    <div>
                        <Label>Arbeidsgiver/Nav</Label>
                    </div>
                    <div>
                        <Label>Inntekt</Label>
                    </div>
                    <div>
                        <Label>Tillegg</Label>
                    </div>
                    <div>
                        <Label>Totalt</Label>
                    </div>
                    <div>
                        <Label>Beskrivelse</Label>
                    </div>
                </div>
                <div>
                    <Label>Utvidet barnetrygd</Label>
                    <div>
                        <Label>Periode</Label>
                    </div>
                    <div>
                        <Label>Delt bosted</Label>
                    </div>
                    <div>
                        <Label>Beløp</Label>
                    </div>
                </div>
                <div>
                    <Label>Kontantstøtte (for hele året/ per barn)</Label>
                    <div>
                        <Label>Periode</Label>
                    </div>
                    <div>
                        <Label>Barn</Label>
                    </div>
                </div>
                <div>
                    <Label>Barnetillegg (for bidragsbarnet, per måned i tillegg til inntekter)</Label>
                    <div>
                        <Label>Fra og med</Label>
                    </div>
                    <div>
                        <Label>Til og med</Label>
                    </div>
                    <div>
                        <Label>Barn</Label>
                    </div>
                    <div>
                        <Label>Barnetillegg (brutto)</Label>
                    </div>
                    <div>
                        <Label>Skattesats</Label>
                    </div>
                    <div>
                        <Label>Barnetillegg (netto)</Label>
                    </div>
                </div>
                <div>
                    <Label>Kommentar</Label>
                    <Textarea label="Begrunnelse (med i vedtaket og notat)" />
                    <TextField label="Begrunnelse (kun med i notat)" />
                    <CheckboxGroup
                        legend="Skal til to-trinns kontroll."
                        hideLegend
                        onChange={(val: any[]) => console.log(val)}
                    >
                        <Checkbox value="true">Skal til to-trinns kontroll.</Checkbox>
                    </CheckboxGroup>
                </div>
                <div>
                    <Button loading={false} onClick={() => {}} className="w-max">
                        Gå videre
                    </Button>
                    <Button loading={false} variant="secondary" onClick={() => {}} className="w-max">
                        Oppfrisk
                    </Button>
                    <Button loading={false} variant="secondary" onClick={() => {}} className="w-max">
                        Lagre
                    </Button>
                    <Link href="#" onClick={() => {}} className="font-bold">
                        Vis notat <ExternalLink aria-hidden />
                    </Link>
                </div>
            </div>
        </div>
    );
}
