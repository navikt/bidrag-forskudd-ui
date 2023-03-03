import { Loader } from "@navikt/ds-react";
import React, { lazy, memo, Suspense } from "react";

import { useForskudd } from "../../context/ForskuddContext";
import { ForskuddStepper } from "../../enum/ForskuddStepper";
const Boforhold = lazy(() => import("./Boforhold"));
const Inntekt = lazy(() => import("./inntekt/Inntekt"));
const Vedtak = lazy(() => import("./Vedtak"));
const Virkningstidspunkt = lazy(() => import("./Virkningstidspunkt"));

const ForskuddForm = memo(({ activeStep }: { activeStep: string }) => {
    switch (activeStep) {
        case ForskuddStepper.VIRKNINGSTIDSPUNKT:
            return <Virkningstidspunkt />;
        case ForskuddStepper.INNTEKT:
            return <Inntekt />;
        case ForskuddStepper.BOFORHOLD:
            return <Boforhold />;
        case ForskuddStepper.VEDTAK:
            return <Vedtak />;
        default:
            return <Virkningstidspunkt />;
    }
});

export default function FormWrapper() {
    const { activeStep } = useForskudd();

    return (
        <Suspense
            fallback={
                <div className="flex justify-center">
                    <Loader size="3xlarge" title="venter..." />
                </div>
            }
        >
            <ForskuddForm activeStep={activeStep} />
        </Suspense>
    );
}
