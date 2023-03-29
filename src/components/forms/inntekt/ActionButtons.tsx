import { ExternalLinkIcon } from "@navikt/aksel-icons";
import { Button, Link } from "@navikt/ds-react";
import React from "react";
import { useParams } from "react-router-dom";

import { ActionStatus } from "../../../types/actionStatus";
import { FlexRow } from "../../layout/grid/FlexRow";

export const ActionButtons = ({ action, onNext }) => {
    const { behandlingId } = useParams<{ behandlingId?: string }>();
    return (
        <FlexRow className="items-center">
            <Button type="button" variant="secondary" onClick={onNext} className="w-max" size="small">
                Gå videre
            </Button>
            <Button loading={action === ActionStatus.SUBMITTING} variant="primary" className="w-max" size="small">
                Lagre
            </Button>
            <Link href={`/forskudd/${behandlingId}/notat`} target="_blank" className="font-bold">
                Vis notat <ExternalLinkIcon aria-hidden />
            </Link>
        </FlexRow>
    );
};
