import { Rolletype } from "@api/BidragBehandlingApiV1";
import { Tag } from "@navikt/ds-react";
import React from "react";

import { ROLE_FORKORTELSER, ROLE_TAGS } from "../constants/roleTags";

export const RolleTag = ({ rolleType }: { rolleType: Rolletype }) => {
    return (
        <Tag variant={ROLE_TAGS[rolleType]} size="small" className="w-8 mr-2 rounded">
            {ROLE_FORKORTELSER[rolleType]}
        </Tag>
    );
};
