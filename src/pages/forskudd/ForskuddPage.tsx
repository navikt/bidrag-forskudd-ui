import { FileIcon } from "@navikt/aksel-icons";
import { BidragContainer } from "@navikt/bidrag-ui-common";
import { Alert, Button, Heading, Stepper } from "@navikt/ds-react";
import React, { useRef, useState } from "react";

import { Vedtakstype } from "../../api/BidragBehandlingApiV1";
import FormWrapper from "../../components/forms/FormWrapper";
import { FlexRow } from "../../components/layout/grid/FlexRow";
import { ConfirmationModal } from "../../components/modal/ConfirmationModal";
import { STEPS } from "../../constants/steps";
import text from "../../constants/texts";
import { useForskudd } from "../../context/ForskuddContext";
import { ForskuddStepper } from "../../enum/ForskuddStepper";
import { useGetBehandlingV2 } from "../../hooks/useApiData";
import { capitalize } from "../../utils/string-utils";
import PageWrapper from "../PageWrapper";
export const ForskuddPage = () => {
    const { activeStep, setActiveStep, pageErrorsOrUnsavedState, setPageErrorsOrUnsavedState } = useForskudd();
    const {
        virkningstidspunkt,
        erVedtakFattet,
        vedtakstype,
        inntekter: { valideringsfeil: inntektValideringsfeil },
    } = useGetBehandlingV2();
    const [nextStep, setNextStep] = useState<number>(undefined);
    const interactive = !virkningstidspunkt.avslag && vedtakstype != Vedtakstype.OPPHOR;
    const activeStepIndex = STEPS[activeStep];
    const ref = useRef<HTMLDialogElement>(null);
    const onConfirm = () => {
        ref.current?.close();
        setActiveStep(nextStep);
        setPageErrorsOrUnsavedState({ ...pageErrorsOrUnsavedState, [activeStep]: { error: false } });
    };

    const onStepChange = (x: number) => {
        const currentPageErrors = pageErrorsOrUnsavedState[activeStep];

        if (
            currentPageErrors &&
            (currentPageErrors.error ||
                (currentPageErrors.openFields && Object.values(currentPageErrors.openFields).some((open) => open)))
        ) {
            setNextStep(x);
            ref.current?.showModal();
        } else {
            setActiveStep(x);
        }
    };

    return (
        <PageWrapper name="tracking-wide">
            <ConfirmationModal
                ref={ref}
                description={text.varsel.ønskerDuÅGåVidereDescription}
                heading={
                    <Heading size="small" className="flex gap-x-1.5 items-center">
                        <FileIcon title="a11y-title" fontSize="1.5rem" />
                        {text.varsel.ønskerDuÅGåVidere}
                    </Heading>
                }
                footer={
                    <>
                        <Button type="button" onClick={() => ref.current?.close()} size="small">
                            {text.label.tilbakeTilUtfylling}
                        </Button>
                        <Button type="button" variant="secondary" size="small" onClick={onConfirm}>
                            {text.label.gåVidereUtenÅLagre}
                        </Button>
                    </>
                }
            />
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
                            {capitalize(ForskuddStepper.VIRKNINGSTIDSPUNKT)}
                        </Stepper.Step>
                        <Stepper.Step completed={activeStepIndex > 2} interactive={interactive}>
                            {capitalize(ForskuddStepper.BOFORHOLD)}
                        </Stepper.Step>
                        <Stepper.Step
                            completed={
                                activeStepIndex > 3 &&
                                (!inntektValideringsfeil || !Object.keys(inntektValideringsfeil).length)
                            }
                            interactive={interactive}
                        >
                            {capitalize(ForskuddStepper.INNTEKT)}
                        </Stepper.Step>
                        <Stepper.Step completed={erVedtakFattet}>{capitalize(ForskuddStepper.VEDTAK)}</Stepper.Step>
                    </Stepper>
                </FlexRow>
                <FormWrapper />
            </BidragContainer>
        </PageWrapper>
    );
};
