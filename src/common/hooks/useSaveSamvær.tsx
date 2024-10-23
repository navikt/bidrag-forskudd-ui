import { BehandlingDtoV2 } from "@api/BidragBehandlingApiV1";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import {
    QueryKeys,
    useDeleteSamværberegning,
    useDeleteSamværsperiode,
    useUpdateSamvær,
    useUpdateSamværskalkulator,
} from "@common/hooks/useApiData";
import { useQueryClient } from "@tanstack/react-query";

export const useOnSaveSamvær = () => {
    const queryClient = useQueryClient();
    const { behandlingId } = useBehandlingProvider();
    const mutation = useUpdateSamvær();
    const queryClientUpdater = (updateFn: (currentData: BehandlingDtoV2) => BehandlingDtoV2) =>
        queryClient.setQueryData<BehandlingDtoV2>(QueryKeys.behandlingV2(behandlingId), updateFn);

    return { mutation, queryClientUpdater };
};
export const useOnDeleteSamværskalkulatorBeregning = () => {
    const queryClient = useQueryClient();
    const { behandlingId } = useBehandlingProvider();
    const mutation = useDeleteSamværberegning();
    const queryClientUpdater = (updateFn: (currentData: BehandlingDtoV2) => BehandlingDtoV2) =>
        queryClient.setQueryData<BehandlingDtoV2>(QueryKeys.behandlingV2(behandlingId), updateFn);

    return { mutation, queryClientUpdater };
};
export const useOnSaveSamværskalkulator = () => {
    const queryClient = useQueryClient();
    const { behandlingId } = useBehandlingProvider();
    const mutation = useUpdateSamværskalkulator();
    const queryClientUpdater = (updateFn: (currentData: BehandlingDtoV2) => BehandlingDtoV2) =>
        queryClient.setQueryData<BehandlingDtoV2>(QueryKeys.behandlingV2(behandlingId), updateFn);

    return { mutation, queryClientUpdater };
};
export const useOnDeleteSamværsperiode = () => {
    const queryClient = useQueryClient();
    const { behandlingId } = useBehandlingProvider();
    const mutation = useDeleteSamværsperiode();
    const queryClientUpdater = (updateFn: (currentData: BehandlingDtoV2) => BehandlingDtoV2) =>
        queryClient.setQueryData<BehandlingDtoV2>(QueryKeys.behandlingV2(behandlingId), updateFn);

    return { mutation, queryClientUpdater };
};
