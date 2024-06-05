import { Vedtakstype } from "@api/BidragBehandlingApiV1";
import { FlexRow } from "@common/components/layout/grid/FlexRow";
import { useGetBehandlingV2 } from "@common/hooks/useApiData";
import PageWrapper from "@common/PageWrapper";
import { BidragContainer } from "@navikt/bidrag-ui-common";
import { Alert, Heading, Stepper } from "@navikt/ds-react";
import { capitalize } from "@utils/string-utils";
import React from "react";

import FormWrapper from "../components/forms/FormWrapper";
import { STEPS } from "../constants/steps";
import { useSærligeutgifter } from "../context/SærligeutgifterContext";
import { SærligeutgifterStepper } from "../enum/SærligeutgifterStepper";
export const SærligeufgifterPage = () => {
    const { onStepChange, activeStep } = useSærligeutgifter();
    const {
        virkningstidspunkt,
        erVedtakFattet,
        vedtakstype,
        boforhold: { valideringsfeil: boforholdValideringsfeil },
        inntekter: { valideringsfeil: inntektValideringsfeil },
        ikkeAktiverteEndringerIGrunnlagsdata,
    } = useGetBehandlingV2();
    const interactive = !virkningstidspunkt.avslag && vedtakstype != Vedtakstype.OPPHOR;
    const activeStepIndex = STEPS[activeStep];

    const inntekterIkkeAktiveGrunnlag = ikkeAktiverteEndringerIGrunnlagsdata?.inntekter
        ? Object.keys(ikkeAktiverteEndringerIGrunnlagsdata.inntekter).flatMap(
              (f) => ikkeAktiverteEndringerIGrunnlagsdata.inntekter[f]
          )
        : [];
    return (
        <PageWrapper name="tracking-wide">
            <BidragContainer className="container p-6">
                {erVedtakFattet && (
                    <Alert variant="info" size="small" className="mb-4 w-max m-auto">
                        <Heading level="3" size="small">
                            Vedtak er fattet
                        </Heading>
                        Vedtak er fattet for behandlingen og kan derfor ikke endres
                    </Alert>
                )}
                <FlexRow className="justify-center">
                    <Stepper
                        aria-labelledby="stepper-heading"
                        activeStep={activeStepIndex}
                        onStepChange={(x) => onStepChange(x)}
                        orientation="horizontal"
                        className="mb-8 w-[708px]"
                    >
                        <Stepper.Step completed={activeStepIndex > 1}>
                            {capitalize(SærligeutgifterStepper.UTGIFTER)}
                        </Stepper.Step>
                        <Stepper.Step
                            completed={
                                activeStepIndex > 2 &&
                                (boforholdValideringsfeil?.husstandsbarn == undefined ||
                                    boforholdValideringsfeil?.husstandsbarn?.length == 0) &&
                                boforholdValideringsfeil?.sivilstand == null &&
                                (ikkeAktiverteEndringerIGrunnlagsdata?.husstandsbarn == undefined ||
                                    ikkeAktiverteEndringerIGrunnlagsdata?.husstandsbarn?.length == 0)
                                // ikkeAktiverteEndringerIGrunnlagsdata?.sivilstand == null
                            }
                            interactive={interactive}
                        >
                            {capitalize(SærligeutgifterStepper.BOFORHOLD)}
                        </Stepper.Step>
                        <Stepper.Step
                            completed={
                                activeStepIndex > 3 &&
                                (!inntektValideringsfeil || !Object.keys(inntektValideringsfeil).length) &&
                                inntekterIkkeAktiveGrunnlag.length == 0
                            }
                            interactive={interactive}
                        >
                            {capitalize(SærligeutgifterStepper.INNTEKT)}
                        </Stepper.Step>
                        <Stepper.Step completed={erVedtakFattet}>
                            {capitalize(SærligeutgifterStepper.VEDTAK)}
                        </Stepper.Step>
                    </Stepper>
                </FlexRow>
                <FormWrapper />
            </BidragContainer>
        </PageWrapper>
    );
};
