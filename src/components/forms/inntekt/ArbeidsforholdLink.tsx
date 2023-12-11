import { ExternalLinkIcon } from "@navikt/aksel-icons";
import { Link } from "@navikt/ds-react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { BEHANDLING_API } from "../../../constants/api";
import { useForskudd } from "../../../context/ForskuddContext";

type AinntektButtonProps = {
    ident: string;
};
export default function ArbeidsforholdLink({ ident }: AinntektButtonProps) {
    const { behandlingId } = useForskudd();

    const ainntektLenke = useSuspenseQuery({
        queryKey: ["arbeidsforhold_lenke", ident],
        queryFn: async () => {
            const response = await BEHANDLING_API.api.arbeidsforholdLenke({
                behandlingId: behandlingId,
                ident,
            });
            return response.data;
        },
    });

    return (
        <Link href={ainntektLenke.data} target="_blank" className="font-bold">
            AA-register <ExternalLinkIcon aria-hidden />
        </Link>
    );
}
