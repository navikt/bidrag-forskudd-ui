import { ExternalLink } from "@navikt/ds-icons";
import { Button, Heading, Link } from "@navikt/ds-react";
import React from "react";

import { CommonFormProps } from "../../pages/forskudd/ForskuddPage";

export default function Vedtak({ setActiveStep }: CommonFormProps) {
    return (
        <div>
            <Heading level="2" size="large">
                Fatte vedtak
            </Heading>
            <div>
                Totrinnskontroll: inntekt
            </div>
            <Heading level="3" size="medium">
                Oppsummering
            </Heading>
            <div>
            Barn i egen husstand: 
            </div>
            <div>
                tabel
            </div>

            <Heading level="3" size="medium">
                Forsendelse gjelder:
            </Heading>
            <div>
                Mia  Cathrine Svendsen 
            </div>
            <Heading level="3" size="medium">
                Sjekk notat
            </Heading>
            <div>
            Så snart vedtaket er fattet, kan den gjenfinnes i sakshistorik. Notatet blir generert automatisk basert  på opplysningene oppgitt.   
            </div>
            <div>
                Sjekk notat
            </div>
            <div>
                Bekreft
            </div>
            <div className="mt-4">
                
            <div>
                    <Button loading={false} onClick={() => {}} className="w-max">
                        Fatte veddtak
                    </Button>
                    <Button loading={false} variant="secondary" onClick={() => {}} className="w-max">
                        Avbryt
                    </Button>
                </div>
            </div>
        </div>
    );
}
