import { useApi } from "@navikt/bidrag-ui-common";
import { AxiosResponse } from "axios";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";

import { Api as BidragBehandlingApi, BehandlingDto, UpdateBehandlingRequest } from "../api/BidragBehandlingApi";
import { BidragSakDto } from "../api/BidragSakApi";
import { BIDRAG_SAK_API, PERSON_API } from "../constants/api";
import environment from "../environment";
import { mapPersonsToRoles } from "../utils/roles-utils";

export const useApiData = () => {
    const [networkError, setNetworkError] = useState<string>(null);

    const fetchSak = async (saksnummer: string) => {
        const sak = await BIDRAG_SAK_API.bidragSak.findMetadataForSak(saksnummer);
        return sak.data;
    };

    const fetchPersons = async (sak: BidragSakDto, signal: AbortSignal) =>
        getDataFromPromises(createPersonPromises(sak, signal));

    const getDataFromPromises = async (promises: Promise<AxiosResponse<any, any>>[]) =>
        await Promise.all([...promises]).then((results) => results.map((result) => result.data));

    const createPersonPromises = (sak: BidragSakDto, signal: AbortSignal) =>
        sak.roller.map((rolle) =>
            PERSON_API.informasjon.hentPersonPost(
                { ident: rolle.fodselsnummer, verdi: rolle.fodselsnummer },
                { signal }
            )
        );

    const behandlingApi: BidragBehandlingApi<BehandlingDto> = useApi(
        new BidragBehandlingApi({ baseURL: environment.url.bidragBehandling }),
        "bidrag-behandling",
        "gcp"
    );

    const queryClient = useQueryClient();

    const listBehandlings = () =>
        useQuery({
            queryKey: `behandlings`,
            queryFn: (): Promise<AxiosResponse<BehandlingDto[]>> => behandlingApi.api.hentBehandlinger(),
            staleTime: 0,
            suspense: true,
        });

    const getBehandling = (behandlingId: number) =>
        useQuery({
            queryKey: `behandling-${behandlingId}`,
            queryFn: (): Promise<AxiosResponse<BehandlingDto>> => behandlingApi.api.hentBehandling(behandlingId),
            staleTime: Infinity,
            suspense: true,
        });

    const updateBehandling = (behandlingId: number) =>
        useMutation({
            mutationFn: (payload: UpdateBehandlingRequest): Promise<AxiosResponse<BehandlingDto>> =>
                behandlingApi.api.oppdaterBehandling(behandlingId, payload),
            onSuccess: (data) => {
                queryClient.setQueryData(`behandling-${behandlingId}`, data);
            },
        });

    const getSakAndRoller = (saksnummer: string) => {
        const { data: sak } = useQuery({
            queryKey: `sak-${saksnummer}`,
            queryFn: () => fetchSak(saksnummer),
            staleTime: Infinity,
        });

        const { data: roller } = useQuery(
            "roller",
            ({ signal }) => fetchPersons(sak, signal).then((personer) => mapPersonsToRoles(sak, personer)),
            {
                staleTime: Infinity,
                enabled: !!sak,
            }
        );

        return { sak: sak, roller: roller };
    };

    const api = {
        getSakAndRoller,
        getBehandling,
        listBehandlings,
        updateBehandling,
    };

    return { api, networkError };
};
