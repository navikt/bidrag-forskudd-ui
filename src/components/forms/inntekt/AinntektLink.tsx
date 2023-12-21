import { ExternalLinkIcon } from "@navikt/aksel-icons";
import { Link } from "@navikt/ds-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { BEHANDLING_API_V1 } from "../../../constants/api";
import { useForskudd } from "../../../context/ForskuddContext";

type AinntektButtonProps = {
    ident: string;
};
export default function AinntektLink({ ident }: AinntektButtonProps) {
    const { behandlingId } = useForskudd();
    const queryClient = useQueryClient();
    const queryKey = ["ainntekt_lenke", ident];
    const ainntektLenke = useQuery({
        queryKey: queryKey,
        queryFn: async () => {
            const response = await BEHANDLING_API_V1.api.genererAinntektLenke({
                behandlingId: behandlingId,
                ident,
            });
            return response.data;
        },
        enabled: false,
    });

    return (
        <Link
            href={ainntektLenke.data}
            target="_blank"
            className="font-bold"
            onMouseOver={() => queryClient.prefetchQuery({ queryKey, staleTime: 20000 })}
        >
            A-inntekt <ExternalLinkIcon aria-hidden />
        </Link>
    );
}
