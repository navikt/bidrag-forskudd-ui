import { Tag } from "@navikt/ds-react";
import React from "react";

import { ROLE_TAGS } from "../constants/roleTags";
import { RolleDto } from "../types/bidragSakTypes";

export const RolleTag = ({ rolleType }: { rolleType: RolleDto["rolleType"] }) => {
    return (
        <Tag variant={ROLE_TAGS[rolleType]} size="small" className="w-8 mr-2 rounded">
            {rolleType}
        </Tag>
    );
};
