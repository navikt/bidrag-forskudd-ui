import { useApi } from "@navikt/bidrag-ui-common";
import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { Api as BidragGrunnlagApi } from "../api/BidragGrunnlagApi";
import { Api as BidragSakApi } from "../api/BidragSakApi";
import { Api as PersonApi } from "../api/PersonApi";
import { PERSON_IKKE_FINNES } from "../constants/error";
import { STEPS } from "../constants/steps";
import environment from "../environment";
import { HentSkattegrunnlagResponse } from "../types/bidragGrunnlagTypes";
import { BidragSakDto } from "../types/bidragSakTypes";
import { IRolleUi } from "../types/rolle";
import { getFullYear } from "../utils/date-utils";
import { removePlaceholder } from "../utils/string-utils";

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

function ForskuddProvider({ saksnummer, children, ...props }: PropsWithChildren<IForskuddContextProps>) {
    const [sak, setSak] = useState<BidragSakDto>(null);
    const [skattegrunnlager, setSkattegrunnlager] = useState<HentSkattegrunnlagResponse[]>([]);
    const [roller, setRoller] = useState<IRolleUi[]>([]);
    const [error, setError] = useState<string>(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const activeStep = searchParams.get("steg");
    const bidragSakApi = useApi(new BidragSakApi({ baseURL: environment.url.bidragSak }), "bidrag-sak", "fss");
    const personApi = useApi(new PersonApi({ baseURL: process.env.BIDRAG_PERSON_URL }), "bidrag-person", "fss");
    const bidragGrunnlagApi = useApi(
        new BidragGrunnlagApi({ baseURL: environment.url.bidragGrunnlag }),
        "bidrag-grunnlag",
        "fss"
    );

    const setActiveStep = useCallback((x: number) => {
        searchParams.delete("steg");
        setSearchParams([...searchParams.entries(), ["steg", Object.keys(STEPS).find((k) => STEPS[k] === x)]]);
    }, []);

    const fetchData = useCallback(async () => {
        if (!didInit) {
            didInit = true;

            const sakPromise = bidragSakApi.bidragSak.findMetadataForSak(saksnummer);
            const skattegrunnlagDtoPromises = [getFullYear() - 1, getFullYear() - 2, getFullYear() - 3].map((year) =>
                bidragGrunnlagApi.integrasjoner.hentSkattegrunnlag({
                    inntektsAar: year.toString(),
                    inntektsFilter: "",
                    personId: "123",
                })
            );

            const [fetchedSak, skattegrunnlag1, skattegrunnlag2, skattegrunnlag3] = await Promise.all([
                sakPromise,
                ...skattegrunnlagDtoPromises,
            ]);
            setSak(fetchedSak.data);
            setSkattegrunnlager([skattegrunnlag1.data, skattegrunnlag2.data, skattegrunnlag3.data]);

            const personPromises = fetchedSak.data.roller.map((rolle) =>
                personApi.informasjon.hentPersonPost({ ident: rolle.fodselsnummer, verdi: rolle.fodselsnummer })
            );
            const [...personer] = await Promise.all([...personPromises]);
            const roller = personer.map((person) => {
                const rolle = fetchedSak.data.roller.find((rolle) => rolle.fodselsnummer === person.data.ident);
                if (!rolle) throw new Error(removePlaceholder(PERSON_IKKE_FINNES, person.data.ident));
                return { ...rolle, ...person.data };
            });
            setRoller(roller);
        }
    }, []);

    useEffect(() => {
        fetchData().catch((error) => setError(error.message));
    }, [fetchData]);

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
