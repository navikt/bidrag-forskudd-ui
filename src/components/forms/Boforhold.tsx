import { ExternalLink } from "@navikt/ds-icons";
import { Button, Heading, Label, Link, Textarea, TextField } from "@navikt/ds-react";
import React from "react";

import { CommonFormProps } from "../../pages/forskudd/ForskuddPage";
import { FlexRow } from "../layout/grid/FlexRow";

export const Boforhold = ({ setActiveStep }: CommonFormProps) => {
    return (
        <div className="grid gap-y-8">
            <div className="grid gap-y-4">
                <Heading level="2" size="xlarge">
                    Boforhold
                </Heading>
                <Heading level="3" size="medium">
                    Barn som er med i saken
                </Heading>
                <FlexRow>
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
                </FlexRow>
            </div>
            <div className="grid gap-y-4">
                <Heading level="3" size="medium">
                    Barn som er ikke med i saken
                </Heading>
                <FlexRow>
                    <div>
                        <Label size="small">Navn</Label>
                    </div>
                    <div>
                        <Label size="small">Fødselsnummer</Label>
                    </div>
                </FlexRow>
                <FlexRow>
                    <div>
                        <Label size="small">Periode</Label>
                    </div>
                    <div>
                        <Label size="small">Registrert på adresse</Label>
                    </div>
                    <div>
                        <Label size="small">Kilde</Label>
                    </div>
                </FlexRow>
            </div>
            <div className="grid gap-y-4">
                <Heading level="3" size="medium">
                    Sivilstand
                </Heading>
                <FlexRow>
                    <div>
                        <Label size="small">Periode</Label>
                    </div>
                    <div>
                        <Label size="small">Sivilstand</Label>
                    </div>
                </FlexRow>
            </div>
            <div className="grid gap-y-4">
                <Heading level="3" size="medium">
                    Kommentar
                </Heading>
                <Textarea label="Begrunnelse (med i vedtaket og notat)" size="small" />
                <TextField label="Begrunnelse (kun med i notat)" size="small" />
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
