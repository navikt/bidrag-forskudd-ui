import { Loader } from "@navikt/ds-react";
import React, { lazy, memo, Suspense } from "react";

import text from "../../constants/texts";
import { useForskudd } from "../../context/ForskuddContext";
import { ForskuddStepper } from "../../enum/ForskuddStepper";
const Boforhold = lazy(() => import("./boforhold/Boforhold"));
const Inntekt = lazy(() => import("./inntekt/Inntekt"));
const Vedtak = lazy(() => import("./vedtak/Vedtak"));
const Virkningstidspunkt = lazy(() => import("./virkningstidspunkt/Virkningstidspunkt"));

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
                    <Loader size="3xlarge" title={text.loading} variant="interaction" />
                </div>
            }
        >
            <ForskuddForm activeStep={activeStep} />
        </Suspense>
    );
}
