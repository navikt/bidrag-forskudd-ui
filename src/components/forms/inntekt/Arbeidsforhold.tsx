import { capitalize } from "@navikt/bidrag-ui-common";
import { Label } from "@navikt/ds-react";
import React from "react";

import { OpplysningerType } from "../../../api/BidragBehandlingApi";
import { ArbeidsforholdDto } from "../../../api/BidragGrunnlagApi";
import { useForskudd } from "../../../context/ForskuddContext";
import { useGetOpplysninger, useHentArbeidsforhold } from "../../../hooks/useApiData";
import { ISODateTimeStringToDDMMYYYYString } from "../../../utils/date-utils";
import ArbeidsforholdLink from "./ArbeidsforholdLink";

interface ArbeidsforholdTabledata {
    periodeFra: string;
    periodeTil?: string;
    arbeidsgivernavn: string;
    sisteLønnsendring: string;
    stillingsprosent: string;
}

type ArbeidsforholdProps = {
    ident: string;
};
export const Arbeidsforhold = ({ ident }: ArbeidsforholdProps) => {
    const { behandlingId } = useForskudd();
    const { data: arbeidsforholdOpplysninger } = useGetOpplysninger(behandlingId, OpplysningerType.ARBEIDSFORHOLD);
    const { data: arbeidsforhold } = useHentArbeidsforhold();

    const savedOpplysninger: ArbeidsforholdDto[] = arbeidsforholdOpplysninger?.data
        ? JSON.parse(arbeidsforholdOpplysninger.data)
        : null;

    const arbeidsforholdListe = savedOpplysninger ?? arbeidsforhold.arbeidsforholdListe;

    const arbeidsforholdTableData = arbeidsforholdListe.filter((af) => af.partPersonId == ident).map(mapToTabledata);
    return (
        <div className="grid gap-y-2">
            <div className="inline-flex items-center gap-x-4">
                <Label size="small">Nåværende arbeidsforhold</Label>
                <ArbeidsforholdLink ident={ident} />
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
                  new Date(a.periodeFra as string) > new Date(b.periodeFra as string) ? 1 : -1
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
