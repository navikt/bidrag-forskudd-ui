import { Tag } from "@navikt/ds-react";
import React from "react";

import { RolleDtoRolleType } from "../api/BidragBehandlingApi";
import { ROLE_FORKORTELSER, ROLE_TAGS } from "../constants/roleTags";

export const RolleTag = ({ rolleType }: { rolleType: RolleDtoRolleType }) => {
    return (
        <Tag variant={ROLE_TAGS[rolleType]} size="small" className="w-8 mr-2 rounded">
            {ROLE_FORKORTELSER[rolleType]}
        </Tag>
    );
};
