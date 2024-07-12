import text from "@common/constants/texts";
import { BehandlingProvider } from "@common/context/BehandlingContext";
import React, { PropsWithChildren, useState } from "react";

import { STEPS as SærligeutgifterSteps } from "../../særligeutgifter/constants/steps";
import { SærligeutgifterStepper } from "../enum/SærligeutgifterStepper";

export type InntektTables =
    | "småbarnstillegg"
    | "utvidetBarnetrygd"
    | `årsinntekter.${string}`
    | `barnetillegg.${string}`
    | `kontantstøtte.${string}`;

type HusstandsbarnTables = "sivilstand" | "newBarn" | `husstandsbarn.${string}`;

export type PageErrorsOrUnsavedState = {
    utgifter: { error: boolean; openFields?: boolean };
    boforhold: {
        error: boolean;
        openFields?: { [key in HusstandsbarnTables]: boolean };
    };
    inntekt: {
        error: boolean;
        openFields?: {
            [key in InntektTables]: boolean;
        };
    };
};

function SærligeugifterProviderWrapper({ children }: PropsWithChildren) {
    const [pageErrorsOrUnsavedState, setPageErrorsOrUnsavedState] = useState<PageErrorsOrUnsavedState>({
        utgifter: { error: false },
        boforhold: { error: false },
        inntekt: { error: false },
    });
    const formSteps = { defaultStep: SærligeutgifterStepper.UTGIFTER, steps: SærligeutgifterSteps };

    function getPageErrorTexts(): { title: string; description: string } {
        return {
            title: text.varsel.statusIkkeLagret,
            description: text.varsel.statusIkkeLagretDescription,
        };
    }

    const value = React.useMemo(
        () => ({
            formSteps,
            getPageErrorTexts,
            pageErrorsOrUnsavedState,
            setPageErrorsOrUnsavedState,
        }),
        [pageErrorsOrUnsavedState]
    );

    return <BehandlingProvider props={value}>{children}</BehandlingProvider>;
}

export { SærligeugifterProviderWrapper };
