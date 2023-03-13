import React, { createContext, PropsWithChildren, useCallback, useContext, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { STEPS } from "../constants/steps";
import { ForskuddStepper } from "../enum/ForskuddStepper";
import { InntektFormValues } from "../types/inntektFormValues";
import { VirkningstidspunktFormValues } from "../types/virkningstidspunktFormValues";

interface IForskuddContext {
    activeStep: string;
    setActiveStep: (x: number) => void;
    saksnummer: string;
    virkningstidspunktFormValues: VirkningstidspunktFormValues;
    setVirkningstidspunktFormValues: (values: VirkningstidspunktFormValues) => void;
    inntektFormValues: InntektFormValues;
    setInntektFormValues: (values: InntektFormValues) => void;
    boforholdFormValues: any;
    setBoforholdFormValues: (values: any) => void;
}

interface IForskuddContextProps {
    saksnummer: string;
}

export const ForskuddContext = createContext<IForskuddContext | null>(null);

function ForskuddProvider({ saksnummer, children }: PropsWithChildren<IForskuddContextProps>) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [virkningstidspunktFormValues, setVirkningstidspunktFormValues] = useState(undefined);
    const [inntektFormValues, setInntektFormValues] = useState(undefined);
    const [boforholdFormValues, setBoforholdFormValues] = useState(undefined);
    const activeStep = searchParams.get("steg") ?? ForskuddStepper.VIRKNINGSTIDSPUNKT;
    const setActiveStep = useCallback((x: number) => {
        searchParams.delete("steg");
        setSearchParams([...searchParams.entries(), ["steg", Object.keys(STEPS).find((k) => STEPS[k] === x)]]);
    }, []);

    const value = React.useMemo(
        () => ({
            activeStep,
            setActiveStep,
            saksnummer,
            virkningstidspunktFormValues,
            setVirkningstidspunktFormValues,
            inntektFormValues,
            setInntektFormValues,
            boforholdFormValues,
            setBoforholdFormValues,
        }),
        [activeStep, saksnummer, virkningstidspunktFormValues, inntektFormValues, boforholdFormValues]
    );

    return <ForskuddContext.Provider value={value}>{children}</ForskuddContext.Provider>;
}
function useForskudd() {
    const context = useContext(ForskuddContext);
    if (context === undefined) {
        throw new Error("useForskudd must be used within a ForskuddProvider");
    }
    return context;
}

export { ForskuddProvider, useForskudd };
