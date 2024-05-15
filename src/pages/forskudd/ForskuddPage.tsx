import { BidragContainer } from "@navikt/bidrag-ui-common";
import { Alert, Heading, Stepper } from "@navikt/ds-react";
import React from "react";

import { Vedtakstype } from "../../api/BidragBehandlingApiV1";
import FormWrapper from "../../components/forms/FormWrapper";
import { STEPS } from "../../constants/steps";
import { useForskudd } from "../../context/ForskuddContext";
import { ForskuddStepper } from "../../enum/ForskuddStepper";
import { useGetBehandlingV2 } from "../../hooks/useApiData";
import { capitalize } from "../../utils/string-utils";
import PageWrapper from "../PageWrapper";
export const ForskuddPage = () => {
    const { activeStep, setActiveStep } = useForskudd();
    const { virkningstidspunkt, erVedtakFattet, vedtakstype } = useGetBehandlingV2();
    const interactive = !virkningstidspunkt.avslag && vedtakstype != Vedtakstype.OPPHOR;

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
                <Stepper
                    aria-labelledby="stepper-heading"
                    activeStep={STEPS[activeStep]}
                    onStepChange={(x) => setActiveStep(x)}
                    orientation="horizontal"
                    className="mb-8"
                >
                    <Stepper.Step>{capitalize(ForskuddStepper.VIRKNINGSTIDSPUNKT)}</Stepper.Step>
                    <Stepper.Step interactive={interactive}>{capitalize(ForskuddStepper.BOFORHOLD)}</Stepper.Step>
                    <Stepper.Step interactive={interactive}>{capitalize(ForskuddStepper.INNTEKT)}</Stepper.Step>
                    <Stepper.Step>{capitalize(ForskuddStepper.VEDTAK)}</Stepper.Step>
                </Stepper>
                <FormWrapper />
            </BidragContainer>
        </PageWrapper>
    );
};
