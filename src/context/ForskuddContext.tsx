import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { STEPS } from "../constants/steps";
import { ForskuddStepper } from "../enum/ForskuddStepper";
import { useApiEndpoints } from "../hooks/useApiEndpoints";
import { HentSkattegrunnlagResponse } from "../types/bidragGrunnlagTypes";
import { BidragSakDto } from "../types/bidragSakTypes";
import { IRolleUi } from "../types/rolle";

interface IForskuddContext {
    skattegrunnlager: HentSkattegrunnlagResponse[];
    sak: BidragSakDto;
    roller: IRolleUi[];
    activeStep: string;
    setActiveStep: (x: number) => void;
    error: string;
}

interface IForskuddContextProps {
    saksnummer: string;
}

export const ForskuddContext = createContext<IForskuddContext | null>(null);
let didInit = false;
let fetchedSkattegrunnlag = false;
function ForskuddProvider({ saksnummer, children, ...props }: PropsWithChildren<IForskuddContextProps>) {
    const {
        data: { sak, skattegrunnlager, roller },
        api,
    } = useApiEndpoints();
    const [error, setError] = useState<string>(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const activeStep = searchParams.get("steg");

    const setActiveStep = useCallback((x: number) => {
        searchParams.delete("steg");
        setSearchParams([...searchParams.entries(), ["steg", Object.keys(STEPS).find((k) => STEPS[k] === x)]]);
    }, []);

    useEffect(() => {
        if (sak) api.getPersons(sak).catch((error) => setError(error.message));
    }, [sak]);

    useEffect(() => {
        if (activeStep === ForskuddStepper.INNTEKT && !fetchedSkattegrunnlag) {
            fetchedSkattegrunnlag = true;
            api.getSkattegrunnlager().catch((error) => setError(error.message));
        }
    }, [activeStep]);

    useEffect(() => {
        if (!didInit) {
            didInit = true;
            api.getSak(saksnummer).catch((error) => setError(error.message));
        }
    }, []);

    return (
        <ForskuddContext.Provider value={{ skattegrunnlager, sak, roller, activeStep, setActiveStep, error, ...props }}>
            {children}
        </ForskuddContext.Provider>
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
