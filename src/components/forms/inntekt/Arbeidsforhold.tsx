import { ExternalLink } from "@navikt/ds-icons";
import { BodyShort, Label, Link } from "@navikt/ds-react";
import React from "react";

import { FlexRow } from "../../layout/grid/FlexRow";

export const Arbeidsforhold = ({ arbeidsforholder }) => (
    <div className="grid gap-y-2">
        <div className="inline-flex items-center gap-x-4">
            <Label size="small">Nåværende arbeidsforhold</Label>
            <Link href="src/components/forms#" onClick={() => {}} className="font-bold">
                AA-register <ExternalLink aria-hidden />
            </Link>
        </div>
        {arbeidsforholder.map((arbeidsforhold) => (
            <FlexRow key={`${arbeidsforhold.periode.fraDato}-${arbeidsforhold.periode.tilDato}`} className="gap-x-12">
                <div>
                    <Label size="small">Periode</Label>
                    <BodyShort size="small">
                        {arbeidsforhold.periode.fraDato} - {arbeidsforhold.periode.tilDato}
                    </BodyShort>
                </div>
                <div>
                    <Label size="small">Arbeidsgiver</Label>
                    <BodyShort size="small">{arbeidsforhold.arbeidsgiverNavn}</BodyShort>
                </div>
                <div>
                    <Label size="small">Stilling</Label>
                    <BodyShort size="small">{arbeidsforhold.stillingsprosent}</BodyShort>
                </div>
                <div>
                    <Label size="small">Lønnsendring</Label>
                    <BodyShort size="small">{arbeidsforhold.sisteLoennsendring}</BodyShort>
                </div>
            </FlexRow>
        ))}
    </div>
);
