import text from "@common/constants/texts";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { Loader } from "@navikt/ds-react";
import React, { memo, Suspense } from "react";

import { SærligeutgifterStepper } from "../../enum/SærligeutgifterStepper";

const SærligeutgifterForm = memo(({ activeStep }: { activeStep: string }) => {
    switch (activeStep) {
        case SærligeutgifterStepper.UTGIFTER:
            return null;
        case SærligeutgifterStepper.INNTEKT:
            return null;
        case SærligeutgifterStepper.BOFORHOLD:
            return null;
        case SærligeutgifterStepper.VEDTAK:
            return null;
        default:
            return null;
    }
});

export default function FormWrapper() {
    const { activeStep } = useBehandlingProvider();

    return (
        <Suspense
            fallback={
                <div className="flex justify-center">
                    <Loader size="3xlarge" title={text.loading} variant="interaction" />
                </div>
            }
        >
            <SærligeutgifterForm activeStep={activeStep} />
        </Suspense>
    );
}
