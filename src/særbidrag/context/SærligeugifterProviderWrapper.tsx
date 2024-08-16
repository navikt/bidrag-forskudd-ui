import text from "@common/constants/texts";
import { BehandlingProvider } from "@common/context/BehandlingContext";
import React, { PropsWithChildren, useState } from "react";

import { STEPS as SærligeutgifterSteps } from "../constants/steps";
import { SærligeutgifterStepper } from "../enum/SærligeutgifterStepper";

export type InntektTables =
    | `småbarnstillegg.${string}`
    | `utvidetBarnetrygd.${string}`
    | `årsinntekter.${string}`
    | `barnetillegg.${string}`
    | `kontantstøtte.${string}`;

type HusstandsbarnTables = "andreVoksneIHusstanden" | "sivilstand" | "newBarn" | `husstandsbarn.${string}`;

export type PageErrorsOrUnsavedState = {
    utgifter: {
        error: boolean;
        openFields?: {
            utgifterList: boolean;
        };
    };
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
    const formSteps = { defaultStep: SærligeutgifterStepper.UTGIFT, steps: SærligeutgifterSteps };

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
        [JSON.stringify(pageErrorsOrUnsavedState)]
    );

    return <BehandlingProvider props={value}>{children}</BehandlingProvider>;
}

export { SærligeugifterProviderWrapper };
