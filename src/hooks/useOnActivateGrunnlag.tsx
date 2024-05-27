import { useQueryClient } from "@tanstack/react-query";

import { BehandlingDtoV2 } from "../api/BidragBehandlingApiV1";
import { useForskudd } from "../context/ForskuddContext";
import { QueryKeys, useAktiverGrunnlagsdata } from "./useApiData";

export const useOnActivateGrunnlag = () => {
    const queryClient = useQueryClient();
    const { behandlingId } = useForskudd();
    const mutation = useAktiverGrunnlagsdata();
    const queryClientUpdater = (updateFn: (currentData: BehandlingDtoV2) => BehandlingDtoV2) =>
        queryClient.setQueryData<BehandlingDtoV2>(QueryKeys.behandlingV2(behandlingId), updateFn);

    return { mutation, queryClientUpdater };
};
