import { capitalize } from "@navikt/bidrag-ui-common";
import { Label } from "@navikt/ds-react";
import React from "react";

import { OpplysningerType } from "../../../api/BidragBehandlingApiV1";
import { ArbeidsforholdGrunnlagDto } from "../../../api/BidragGrunnlagApi";
import text from "../../../constants/texts";
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
    const arbeidsforholdListeGrunnlag = useHentArbeidsforhold();
    const arbeidsforholdOpplysninger = useGetOpplysninger<ArbeidsforholdGrunnlagDto[]>(OpplysningerType.ARBEIDSFORHOLD);
    const arbeidsforholdListe = arbeidsforholdOpplysninger ?? arbeidsforholdListeGrunnlag;

    const arbeidsforholdTableData = arbeidsforholdListe.filter((af) => af.partPersonId == ident).map(mapToTabledata);
    return (
        <div className="grid gap-y-2">
            <div className="inline-flex items-center gap-x-4">
                <Label size="small">{text.label.nåværendeArbeidsforhold}</Label>
                <ArbeidsforholdLink ident={ident} />
            </div>
            <table>
                <thead>
                    <tr>
                        <td>{text.label.periode}</td>
                        <td>{text.label.arbeidsgiver}</td>
                        <td>{text.label.stilling}</td>
                        <td>{text.label.lønnsendring}</td>
                    </tr>
                </thead>
                <tbody>
                    {arbeidsforholdTableData.map((arbeidsforhold, index) => (
                        <tr key={`${arbeidsforhold.arbeidsgivernavn}-${index}`}>
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

function mapToTabledata(arbeidsforhold: ArbeidsforholdGrunnlagDto): ArbeidsforholdTabledata {
    const sisteAnsettelsesDetalj =
        arbeidsforhold.ansettelsesdetaljerListe?.length > 0
            ? arbeidsforhold.ansettelsesdetaljerListe.sort((a, b) =>
                  new Date(a.periodeFra as string) > new Date(b.periodeFra as string) ? 1 : -1
              )[0]
            : null;
    return {
        periodeFra: ISODateTimeStringToDDMMYYYYString(arbeidsforhold.startdato),
        periodeTil:
            arbeidsforhold.sluttdato == null ? null : ISODateTimeStringToDDMMYYYYString(arbeidsforhold.sluttdato),
        arbeidsgivernavn: capitalize(arbeidsforhold.arbeidsgiverNavn),
        sisteLønnsendring:
            sisteAnsettelsesDetalj?.sisteLønnsendringDato != null
                ? ISODateTimeStringToDDMMYYYYString(sisteAnsettelsesDetalj.sisteLønnsendringDato)
                : "-",
        stillingsprosent:
            sisteAnsettelsesDetalj?.avtaltStillingsprosent != null
                ? sisteAnsettelsesDetalj.avtaltStillingsprosent + "%"
                : "-",
    };
}
