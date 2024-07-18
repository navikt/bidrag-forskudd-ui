import { Arbeidsforhold } from "@common/components/inntekt/Arbeidsforhold";
import { InntektChart } from "@common/components/inntekt/InntektChart";
import { QueryErrorWrapper } from "@common/components/query-error-boundary/QueryErrorWrapper";
import text from "@common/constants/texts";
import { useGetBehandlingV2 } from "@common/hooks/useApiData";
import { ExpansionCard } from "@navikt/ds-react";
import React from "react";

export const InntektHeader = ({ ident }: { ident: string }) => {
    const { inntekter } = useGetBehandlingV2();
    const månedsinntekter = inntekter.månedsinntekter?.filter((månedsinntekt) => månedsinntekt.ident === ident);
    return (
        <div className="grid w-full max-w-[65ch] gap-y-8">
            <InntektChart inntekt={månedsinntekter} />
            <ExpansionCard aria-label="default-demo" size="small">
                <ExpansionCard.Header>
                    <ExpansionCard.Title size="small">{text.title.arbeidsforhold}</ExpansionCard.Title>
                </ExpansionCard.Header>
                <ExpansionCard.Content>
                    <QueryErrorWrapper>
                        <Arbeidsforhold ident={ident} />
                    </QueryErrorWrapper>
                </ExpansionCard.Content>
            </ExpansionCard>
        </div>
    );
};
