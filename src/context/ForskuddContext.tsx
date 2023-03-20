import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { Api as BidragBehandlingApi, BehandlingDto } from "../api/BidragBehandlingApi";
import { STEPS } from "../constants/steps";
import { ForskuddStepper } from "../enum/ForskuddStepper";
import { InntektFormValues } from "../types/inntektFormValues";
import { VirkningstidspunktFormValues } from "../types/virkningstidspunktFormValues";

interface IForskuddContext {
    activeStep: string;
    setActiveStep: (x: number) => void;
    behandling: BehandlingDto;
    saksnummer: string;
    virkningstidspunktFormValues: VirkningstidspunktFormValues;
    setVirkningstidspunktFormValues: (values: VirkningstidspunktFormValues) => void;
    inntektFormValues: InntektFormValues;
    setInntektFormValues: (values: InntektFormValues) => void;
    boforholdFormValues: any;
    setBoforholdFormValues: (values: any) => void;
}

interface IForskuddContextProps {
    behandlingId: number;
    behandlingApi: BidragBehandlingApi<BehandlingDto>;
}

export const ForskuddContext = createContext<IForskuddContext | null>(null);

function ForskuddProvider({ behandlingId, behandlingApi, children }: PropsWithChildren<IForskuddContextProps>) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [virkningstidspunktFormValues, setVirkningstidspunktFormValues] = useState(undefined);
    const [inntektFormValues, setInntektFormValues] = useState(undefined);
    const [boforholdFormValues, setBoforholdFormValues] = useState(undefined);
    const activeStep = searchParams.get("steg") ?? ForskuddStepper.VIRKNINGSTIDSPUNKT;
    const setActiveStep = useCallback((x: number) => {
        searchParams.delete("steg");
        setSearchParams([...searchParams.entries(), ["steg", Object.keys(STEPS).find((k) => STEPS[k] === x)]]);
    }, []);

    const [behandling, setBehandling] = useState<BehandlingDto>(null);

    // TODO
    const saksnummer = behandlingId + "";

    useEffect(() => {
        behandlingApi.api
            .hentBehandling(behandlingId)
            .then(({ data }) => {
                setBehandling(data);
            })
            .catch((e) => console.log(e));
    }, []);

    const value = React.useMemo(
        () => ({
            activeStep,
            setActiveStep,
            behandling,
            saksnummer,
            virkningstidspunktFormValues,
            setVirkningstidspunktFormValues,
            inntektFormValues,
            setInntektFormValues,
            boforholdFormValues,
            setBoforholdFormValues,
        }),
        [activeStep, behandling, virkningstidspunktFormValues, inntektFormValues, boforholdFormValues]
    );

    return <ForskuddContext.Provider value={value}>{behandling && children}</ForskuddContext.Provider>;
}
function useForskudd() {
    const context = useContext(ForskuddContext);
    if (context === undefined) {
        throw new Error("useForskudd must be used within a ForskuddProvider");
    }
    return context;
}

export { ForskuddProvider, useForskudd };
