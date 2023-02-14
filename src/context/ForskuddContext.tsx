import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { STEPS } from "../constants/steps";
import environment from "../environment";
import SakService from "../service/SakService";
import { IBidragSak } from "../types/bidrag-sak";
import { HentSkattegrunnlagResponse } from "../types/bidragGrunnlagTypes";
import { getFullYear } from "../utils/date-utils";
import { useApi } from "@navikt/bidrag-ui-common";
import { Api as BidragGrunnlagApi } from "../api/BidragGrunnlagApi";

interface IForskuddContext {
    skattegrunnlager: HentSkattegrunnlagResponse[];
    sak: IBidragSak;
    activeStep: string;
    setActiveStep: (x: number) => void;
}

interface IForskuddContextProps {
    saksnummer: string;
}

export const ForskuddContext = createContext<IForskuddContext | null>(null);

function ForskuddProvider({ saksnummer, children, ...props }: PropsWithChildren<IForskuddContextProps>) {
    const [sak, setSak] = useState<IBidragSak>(null);
    const [skattegrunnlager, setSkattegrunnlager] = useState<HentSkattegrunnlagResponse[]>([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const activeStep = searchParams.get("steg");
    const bidragGrunnlagApi = useApi(new BidragGrunnlagApi({ baseURL: environment.url.bidragGrunnlag }), "bidrag-grunnlag", "fss");

    const sakService = new SakService();

    const setActiveStep = useCallback((x: number) => {
        searchParams.delete("steg");
        setSearchParams([...searchParams.entries(), ["steg", Object.keys(STEPS).find((k) => STEPS[k] === x)]]);
    }, []);

    useEffect(() => {
        const sakPromise = sakService.hentSak(saksnummer);
        const skattegrunnlagDtoPromises = [getFullYear() - 1, getFullYear() - 2, getFullYear() - 3].map((year) =>
            bidragGrunnlagApi.integrasjoner.hentSkattegrunnlag({
                inntektsAar: year.toString(),
                inntektsFilter: "",
                personId: "123",
            })
        );

        Promise.all([sakPromise, ...skattegrunnlagDtoPromises])
            .then(([sak, skattegrunnlag1, skattegrunnlag2, skattegrunnlag3]) => {
                setSak(sak);
                setSkattegrunnlager([skattegrunnlag1.data, skattegrunnlag2.data, skattegrunnlag3.data]);
            })
            .catch((error) => {
                console.error(error.message);
            });
    }, []);

    return (
        <ForskuddContext.Provider value={{ skattegrunnlager, sak, activeStep, setActiveStep, ...props }}>
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
