import { Edit, ExternalLink } from "@navikt/ds-icons";
import { Button, Checkbox, CheckboxGroup, Heading, Label, Link, Textarea, TextField } from "@navikt/ds-react";
import React, { useEffect, useState } from "react";

import { CommonFormProps } from "../../pages/forskudd/ForskuddPage";
import GrunnlagService from "../../service/GrunnlagService";
import { HentSkattegrunnlagResponse } from "../../types/bidragGrunnlagTypes";
import { getFullYear } from "../../utils/date-utils";
import { DatePickerModal } from "../date-picker/DatePickerModal";
import { InlineGrid } from "../layout/grid/Grid";

export default function Inntekt({ setActiveStep, personId }: CommonFormProps) {
    const [skattegrunnlag, setSkattegrunnlag] = useState<HentSkattegrunnlagResponse[]>([]);
    const grunnlagService = new GrunnlagService();

    useEffect(() => {
        const skattegrunnlagDtoPromises = [getFullYear(), getFullYear() - 1, getFullYear() - 2].map((year) =>
            grunnlagService.hentSkatteGrunnlag({
                inntektsAar: year.toString(),
                inntektsFilter: "",
                personId,
            })
        );

        Promise.all(skattegrunnlagDtoPromises)
            .then(([skattegrunnlag1, skattegrunnlag2, skattegrunnlag3]) => {
                setSkattegrunnlag([skattegrunnlag1, skattegrunnlag2, skattegrunnlag3]);
            })
            .catch((error) => {
                console.error(error.message);
            });
    }, []);

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
                    <div>
                        <Label size="small">Skattegrunnlag (2020):</Label>
                    </div>
                </div>
            </div>
            <div className="grid gap-y-4">
                <div className="inline-flex">
                    <Heading level="3" size="medium">
                        Andre typer inntekt
                    </Heading>
                    <Link href="#" onClick={() => {}} className="font-bold">
                        A inntekt <ExternalLink aria-hidden />
                    </Link>
                </div>
                <div className="grid gap-y-2">
                    <Label size="small">Kapitalinntekt (2020):</Label>
                    <Label size="small">Næringsinntekt (2020):</Label>
                </div>
            </div>
            <div className="grid gap-y-4">
                <Heading level="3" size="medium">
                    Arbeidsforhold
                </Heading>
                <div className="grid gap-y-2">
                    <div>
                        <Label size="small">Nåværende arbeidsforhold</Label>
                        <Link href="#" onClick={() => {}} className="font-bold">
                            AA-register <ExternalLink aria-hidden />
                        </Link>
                    </div>
                    <InlineGrid>
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
                    </InlineGrid>
                </div>
            </div>
            <div className="grid gap-y-4">
                <Heading level="3" size="medium">
                    Perioder
                </Heading>
                <InlineGrid>
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
                </InlineGrid>
            </div>
            <div className="grid gap-y-4">
                <Heading level="3" size="medium">
                    Utvidet barnetrygd
                </Heading>
                <InlineGrid>
                    <div>
                        <Label size="small">Periode</Label>
                    </div>
                    <div>
                        <Label size="small">Delt bosted</Label>
                    </div>
                    <div>
                        <Label size="small">Beløp</Label>
                    </div>
                </InlineGrid>
            </div>
            <div className="grid gap-y-4">
                <Heading level="3" size="medium">
                    Kontantstøtte (for hele året/ per barn)
                </Heading>
                <InlineGrid>
                    <div>
                        <Label size="small">Periode</Label>
                    </div>
                    <div>
                        <Label size="small">Barn</Label>
                    </div>
                </InlineGrid>
            </div>
            <div className="grid gap-y-4">
                <Heading level="3" size="medium">
                    Barnetillegg (for bidragsbarnet, per måned i tillegg til inntekter)
                </Heading>
                <InlineGrid>
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
                </InlineGrid>
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
            <InlineGrid>
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
            </InlineGrid>
        </div>
    );
}
