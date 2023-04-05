import { ArrowRightIcon, ExternalLinkIcon } from "@navikt/aksel-icons";
import { Button, Link } from "@navikt/ds-react";
import React from "react";
import { useParams } from "react-router-dom";

import { FlexRow } from "../../layout/grid/FlexRow";

export const ActionButtons = ({ onNext }) => {
    const { behandlingId } = useParams<{ behandlingId?: string }>();
    return (
        <FlexRow className="items-center">
            <Button
                type="button"
                onClick={onNext}
                variant="secondary"
                icon={<ArrowRightIcon title="a11y-title" />}
                iconPosition="right"
                className="w-max"
                size="small"
            >
                Gå videre
            </Button>
            <Link href={`/forskudd/${behandlingId}/notat`} target="_blank" className="font-bold">
                Vis notat <ExternalLinkIcon aria-hidden />
            </Link>
        </FlexRow>
    );
};
