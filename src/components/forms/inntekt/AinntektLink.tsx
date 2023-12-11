import { ExternalLinkIcon } from "@navikt/aksel-icons";
import { Link } from "@navikt/ds-react";
import { useQuery } from "@tanstack/react-query";

import { BEHANDLING_API } from "../../../constants/api";
import { useForskudd } from "../../../context/ForskuddContext";

type AinntektButtonProps = {
    ident: string;
};
export default function AinntektLink({ ident }: AinntektButtonProps) {
    const { behandlingId } = useForskudd();
    const ainntektLenke = useQuery({
        queryKey: ["ainntekt_lenke", ident],
        queryFn: async () => {
            const response = await BEHANDLING_API.api.ainntektLenke({
                behandlingId: behandlingId,
                ident,
            });
            return response.data;
        },
    });

    return (
        <Link href={ainntektLenke.data} target="_blank" className="font-bold">
            A-inntekt <ExternalLinkIcon aria-hidden />
        </Link>
    );
}
