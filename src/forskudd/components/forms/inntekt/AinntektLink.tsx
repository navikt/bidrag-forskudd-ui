import { BEHANDLING_API_V1 } from "@common/constants/api";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { ExternalLinkIcon } from "@navikt/aksel-icons";
import { Link } from "@navikt/ds-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type AinntektButtonProps = {
    ident: string;
};
export default function AinntektLink({ ident }: AinntektButtonProps) {
    const { behandlingId } = useBehandlingProvider();
    const queryClient = useQueryClient();
    const queryKey = ["ainntekt_lenke", ident];
    const ainntektLenke = useQuery({
        queryKey: queryKey,
        queryFn: async () => {
            const response = await BEHANDLING_API_V1.api.genererAinntektLenke({
                behandlingId: Number(behandlingId),
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
