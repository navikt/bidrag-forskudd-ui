import { ExternalLink } from "@navikt/ds-icons";
import { Button, Heading, Label, Link, Textarea, TextField } from "@navikt/ds-react";
import React from "react";

import { CommonFormProps } from "../../pages/forskudd/ForskuddPage";
import { InlineGrid } from "../layout/grid/Grid";

export default function Boforhold({ setActiveStep }: CommonFormProps) {
    return (
        <div className="grid gap-y-8">
            <div className="grid gap-y-4">
                <Heading level="2" size="xlarge">
                    Boforhold
                </Heading>
                <Heading level="3" size="medium">
                    Barn som er med i saken
                </Heading>
                <InlineGrid>
                    <div>
                        <Label size="small">Periode</Label>
                    </div>
                    <div>
                        <Label size="small">Bor ikke med foreldre</Label>
                    </div>
                    <div>
                        <Label size="small">Registrert på adresse</Label>
                    </div>
                    <div>
                        <Label size="small">Kilde</Label>
                    </div>
                </InlineGrid>
            </div>
            <div className="grid gap-y-4">
                <Heading level="3" size="medium">
                    Barn som er ikke med i saken
                </Heading>
                <InlineGrid>
                    <div>
                        <Label size="small">Navn</Label>
                    </div>
                    <div>
                        <Label size="small">Fødselsnummer</Label>
                    </div>
                </InlineGrid>
                <InlineGrid>
                    <div>
                        <Label size="small">Periode</Label>
                    </div>
                    <div>
                        <Label size="small">Registrert på adresse</Label>
                    </div>
                    <div>
                        <Label size="small">Kilde</Label>
                    </div>
                </InlineGrid>
            </div>
            <div className="grid gap-y-4">
                <Heading level="3" size="medium">
                    Sivilstand
                </Heading>
                <InlineGrid>
                    <div>
                        <Label size="small">Periode</Label>
                    </div>
                    <div>
                        <Label size="small">Sivilstand</Label>
                    </div>
                </InlineGrid>
            </div>
            <div className="grid gap-y-4">
                <Heading level="3" size="medium">
                    Kommentar
                </Heading>
                <Textarea label="Begrunnelse (med i vedtaket og notat)" size="small" />
                <TextField label="Begrunnelse (kun med i notat)" size="small" />
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
