import { Heading } from "@navikt/ds-react";
import React from "react";

import { CommonFormProps } from "../../pages/forskudd/ForskuddPage";

export default function Vedtak({ setActiveStep }: CommonFormProps) {
    return (
        <div>
            <Heading level="2" size="large">
                Vedtak
            </Heading>
        </div>
    );
}
