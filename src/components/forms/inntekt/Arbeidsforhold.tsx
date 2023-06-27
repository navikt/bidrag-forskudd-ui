import { ExternalLinkIcon } from "@navikt/aksel-icons";
import { BodyShort, Label, Link } from "@navikt/ds-react";
import React from "react";

import { useGetArbeidsforhold } from "../../../__mocks__/mocksForMissingEndpoints/useMockApi";
import { useForskudd } from "../../../context/ForskuddContext";
import { DateToDDMMYYYYString } from "../../../utils/date-utils";
import { FlexRow } from "../../layout/grid/FlexRow";

export const Arbeidsforhold = () => {
    const { behandlingId } = useForskudd();
    const { data: arbeidsforholder } = useGetArbeidsforhold(behandlingId.toString());

    return (
        <div className="grid gap-y-2">
            <div className="inline-flex items-center gap-x-4">
                <Label size="small">Nåværende arbeidsforhold</Label>
                <Link href="src/components/forms#" onClick={() => {}} className="font-bold">
                    AA-register <ExternalLinkIcon aria-hidden />
                </Link>
            </div>
            {arbeidsforholder.map((arbeidsforhold) => (
                <FlexRow
                    key={`${arbeidsforhold.periode.fraDato}-${arbeidsforhold.periode.tilDato}`}
                    className="gap-x-12"
                >
                    <div>
                        <Label size="small">Periode</Label>
                        <BodyShort size="small">
                            {DateToDDMMYYYYString(new Date(arbeidsforhold.periode.fraDato))} -{" "}
                            {DateToDDMMYYYYString(new Date(arbeidsforhold.periode.tilDato))}
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
                        <BodyShort size="small">
                            {DateToDDMMYYYYString(new Date(arbeidsforhold.sisteLoennsendring))}
                        </BodyShort>
                    </div>
                </FlexRow>
            ))}
        </div>
    );
};
