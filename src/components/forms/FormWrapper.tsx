import React, { useMemo } from "react";

import { ForskuddStepper } from "../../enum/ForskuddStepper";
import { Boforhold } from "./Boforhold";
import { Inntekt } from "./Inntekt";
import { Vedtak } from "./Vedtak";
import { Virkningstidspunkt } from "./Virkningstidspunkt";

export interface FormWrapperProps {
    setActiveStep: (number) => void;
    activeStep: string;
}

export default function FormWrapper({ activeStep, ...props }: FormWrapperProps) {
    const renderForm = useMemo(() => {
        switch (activeStep) {
            case ForskuddStepper.VIRKNINGSTIDSPUNKT:
                return <Virkningstidspunkt {...props} />;
            case ForskuddStepper.INNTEKT:
                return <Inntekt {...props} />;
            case ForskuddStepper.BOFORHOLD:
                return <Boforhold {...props} />;
            case ForskuddStepper.VEDTAK:
                return <Vedtak {...props} />;
            default:
                return <Virkningstidspunkt {...props} />;
        }
    }, [activeStep]);

    return renderForm;
}
