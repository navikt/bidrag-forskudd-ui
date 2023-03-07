import { ExternalLink } from "@navikt/ds-icons";
import { Button, Link } from "@navikt/ds-react";
import React from "react";
import { useParams } from "react-router-dom";

import { ActionStatus } from "../../../types/actionStatus";
import { FlexRow } from "../../layout/grid/FlexRow";

export const ActionButtons = ({ action, onSave, onRefetch, isRefetching }) => {
    const { saksnummer } = useParams<{ saksnummer?: string }>();
    return (
        <FlexRow>
            <Button loading={action === ActionStatus.SUBMITTING} className="w-max" size="small">
                Gå videre
            </Button>
            <Button
                type="button"
                loading={isRefetching}
                variant="secondary"
                onClick={onRefetch}
                className="w-max"
                size="small"
            >
                Oppfrisk
            </Button>
            <Button
                type="button"
                loading={action === ActionStatus.SAVING}
                variant="secondary"
                onClick={onSave}
                className="w-max"
                size="small"
            >
                Lagre
            </Button>
            <Link href={`/forskudd/${saksnummer}/notat`} target="_blank" className="font-bold">
                Vis notat <ExternalLink aria-hidden />
            </Link>
        </FlexRow>
    );
};
