import { ExternalLink } from "@navikt/ds-icons";
import { Button, Heading, Label, Link, Textarea, TextField } from "@navikt/ds-react";
import React from "react";

import { CommonFormProps } from "../../pages/forskudd/ForskuddPage";
import { InlineGrid } from "../layout/grid/Grid";

export default function Boforhold({ setActiveStep }: CommonFormProps) {
    return (
        <div className="grid gap-y-8">
            <div className="grid gap-y-4">
                <Heading level="2" size="large">
                    Boforhold
                </Heading>
                <div>
                    <Label>Barn som er med i saken</Label>
                </div>
                <InlineGrid>
                    <div>
                        <Label>Periode</Label>
                    </div>
                    <div>
                        <Label>Bor ikke med foreldre</Label>
                    </div>
                    <div>
                        <Label>Registrert på adresse</Label>
                    </div>
                    <div>
                        <Label>Kilde</Label>
                    </div>
                </InlineGrid>
            </div>
            <div className="grid gap-y-4">
                <div>
                    <Label>Barn som er ikke med i saken</Label>
                </div>
                <InlineGrid>
                    <div>
                        <Label>Navn</Label>
                    </div>
                    <div>
                        <Label>Fødselsnummer</Label>
                    </div>
                </InlineGrid>
                <InlineGrid>
                    <div>
                        <Label>Periode</Label>
                    </div>
                    <div>
                        <Label>Registrert på adresse</Label>
                    </div>
                    <div>
                        <Label>Kilde</Label>
                    </div>
                </InlineGrid>
            </div>
            <div className="grid gap-y-4">
                <Label>Sivilstand</Label>
                <InlineGrid>
                    <div>
                        <Label>Periode</Label>
                    </div>
                    <div>
                        <Label>Sivilstand</Label>
                    </div>
                </InlineGrid>
            </div>
            <div className="grid gap-y-4">
                <Label>Kommentar</Label>
                <Textarea label="Begrunnelse (med i vedtaket og notat)" />
                <TextField label="Begrunnelse (kun med i notat)" />
            </div>
            <InlineGrid>
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
            </InlineGrid>
        </div>
    );
}
