import { ExternalLinkIcon } from "@navikt/aksel-icons";
import { Label, Link } from "@navikt/ds-react";
import React from "react";

import { useForskudd } from "../../../context/ForskuddContext";
import { useHentArbeidsforhold } from "../../../hooks/useApiData";
import { ISODateTimeStringToDDMMYYYYString } from "../../../utils/date-utils";

export const Arbeidsforhold = () => {
    const { behandlingId } = useForskudd();

    const { data: grunnlag } = useHentArbeidsforhold(behandlingId);
    const arbeidsforholdListe = grunnlag.arbeidsforholdListe;

    const arbeidsforholdTableData = arbeidsforholdListe.map((arbeidsforhold) => {
        const sisteAnsettelsesDetalj =
            arbeidsforhold.ansettelsesdetaljer.length > 0
                ? arbeidsforhold.ansettelsesdetaljer.sort((a, b) =>
                      new Date(a.periodeFra) > new Date(b.periodeFra) ? 1 : -1
                  )[0]
                : null;
        return {
            periodeFra: ISODateTimeStringToDDMMYYYYString(arbeidsforhold.startdato),
            periodeTil:
                arbeidsforhold.sluttdato == null ? null : ISODateTimeStringToDDMMYYYYString(arbeidsforhold.sluttdato),
            arbeidsgiverNavn: arbeidsforhold.arbeidsgiverNavn,
            sisteLønnsendring:
                sisteAnsettelsesDetalj.sisteLønnsendringDato != null
                    ? ISODateTimeStringToDDMMYYYYString(sisteAnsettelsesDetalj.sisteLønnsendringDato)
                    : "-",
            stillingsprosent:
                sisteAnsettelsesDetalj.avtaltStillingsprosent != null
                    ? sisteAnsettelsesDetalj.avtaltStillingsprosent + "%"
                    : "-",
        };
    });
    return (
        <div className="grid gap-y-2">
            <div className="inline-flex items-center gap-x-4">
                <Label size="small">Nåværende arbeidsforhold</Label>
                <Link href="src/components/forms#" onClick={() => {}} className="font-bold">
                    AA-register <ExternalLinkIcon aria-hidden />
                </Link>
            </div>
            <table>
                <thead>
                    <td>Periode</td>
                    <td>Arbeidsgiver</td>
                    <td>Stilling</td>
                    <td>Lønnsendring</td>
                </thead>
                <tbody>
                    {arbeidsforholdTableData.map((arbeidsforhold) => (
                        <tr>
                            <td>
                                {arbeidsforhold.periodeFra} - {arbeidsforhold.periodeTil}
                            </td>
                            <td>{arbeidsforhold.arbeidsgiverNavn}</td>
                            <td>{arbeidsforhold.stillingsprosent}</td>
                            <td>{arbeidsforhold.sisteLønnsendring}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
