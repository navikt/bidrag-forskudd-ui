import React, { createContext, PropsWithChildren, useCallback, useContext } from "react";
import { useSearchParams } from "react-router-dom";

import { STEPS } from "../constants/steps";

interface IForskuddContext {
    activeStep: string;
    setActiveStep: (x: number) => void;
}

interface IForskuddContextProps {
    saksnummer: string;
}

export const ForskuddContext = createContext<IForskuddContext | null>(null);

function ForskuddProvider({ saksnummer, children, ...props }: PropsWithChildren<IForskuddContextProps>) {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeStep = searchParams.get("steg");

    const setActiveStep = useCallback((x: number) => {
        searchParams.delete("steg");
        setSearchParams([...searchParams.entries(), ["steg", Object.keys(STEPS).find((k) => STEPS[k] === x)]]);
    }, []);

    return (
        <ForskuddContext.Provider value={{ activeStep, setActiveStep, ...props }}>{children}</ForskuddContext.Provider>
    );
}
function useForskudd() {
    const context = useContext(ForskuddContext);
    if (context === undefined) {
        throw new Error("useForskudd must be used within a ForskuddProvider");
    }
    return context;
}

export { ForskuddProvider, useForskudd };
