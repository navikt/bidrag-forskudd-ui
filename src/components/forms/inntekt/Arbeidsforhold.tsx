import { ExternalLinkIcon } from "@navikt/aksel-icons";
import { capitalize } from "@navikt/bidrag-ui-common";
import { Label, Link } from "@navikt/ds-react";
import React from "react";

import { OpplysningerType } from "../../../api/BidragBehandlingApi";
import { ArbeidsforholdDto } from "../../../api/BidragGrunnlagApi";
import { useForskudd } from "../../../context/ForskuddContext";
import { useGetOpplysninger, useHentArbeidsforhold } from "../../../hooks/useApiData";
import { ISODateTimeStringToDDMMYYYYString } from "../../../utils/date-utils";
import { InntektOpplysninger } from "../helpers/inntektFormHelpers";

interface ArbeidsforholdTabledata {
    periodeFra: string;
    periodeTil?: string;
    arbeidsgivernavn: string;
    sisteLønnsendring: string;
    stillingsprosent: string;
}
export const Arbeidsforhold = () => {
    const { behandlingId } = useForskudd();
    const { data: inntektOpplysninger } = useGetOpplysninger(behandlingId, OpplysningerType.INNTEKTSOPPLYSNINGER);
    const { data: arbeidsforhold } = useHentArbeidsforhold(behandlingId);

    const savedOpplysninger = JSON.parse(inntektOpplysninger.data) as InntektOpplysninger;
    const arbeidsforholdListe = savedOpplysninger.arbeidsforhold ?? arbeidsforhold.arbeidsforholdListe;

    const arbeidsforholdTableData = arbeidsforholdListe.map(mapToTabledata);
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
                            <td>{arbeidsforhold.arbeidsgivernavn}</td>
                            <td>{arbeidsforhold.stillingsprosent}</td>
                            <td>{arbeidsforhold.sisteLønnsendring}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

function mapToTabledata(arbeidsforhold: ArbeidsforholdDto): ArbeidsforholdTabledata {
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
        arbeidsgivernavn: capitalize(arbeidsforhold.arbeidsgiverNavn),
        sisteLønnsendring:
            sisteAnsettelsesDetalj.sisteLønnsendringDato != null
                ? ISODateTimeStringToDDMMYYYYString(sisteAnsettelsesDetalj.sisteLønnsendringDato)
                : "-",
        stillingsprosent:
            sisteAnsettelsesDetalj.avtaltStillingsprosent != null
                ? sisteAnsettelsesDetalj.avtaltStillingsprosent + "%"
                : "-",
    };
}
