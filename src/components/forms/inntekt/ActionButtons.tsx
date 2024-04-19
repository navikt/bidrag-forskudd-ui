import { ExternalLinkIcon } from "@navikt/aksel-icons";
import { Button, Link } from "@navikt/ds-react";
import React from "react";
import { useParams } from "react-router-dom";

import text from "../../../constants/texts";
import { FlexRow } from "../../layout/grid/FlexRow";

export const ActionButtons = ({ onNext }) => {
    const { behandlingId, saksnummer } = useParams<{ behandlingId?: string; saksnummer?: string }>();
    const notatUrl = `/behandling/${behandlingId}/notat`;
    return (
        <FlexRow className="items-center">
            <Button
                type="button"
                onClick={onNext}
                variant="primary"
                iconPosition="right"
                className="w-max"
                size="small"
            >
                {text.label.gåVidere}
            </Button>
            <Link href={saksnummer ? `/sak/${saksnummer}${notatUrl}` : notatUrl} target="_blank" className="font-bold">
                {text.label.notatButton} <ExternalLinkIcon aria-hidden />
            </Link>
        </FlexRow>
    );
};
