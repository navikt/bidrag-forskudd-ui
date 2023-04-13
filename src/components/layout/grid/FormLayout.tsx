import { Heading } from "@navikt/ds-react";
import React from "react";

export const FormLayout = ({ title, main, side }) => (
    <>
        <Heading level="2" size="xlarge">
            {title}
        </Heading>
        <div className="grid columns-1 lg:grid-cols-[70%,auto] gap-x-16">
            <div className="grid gap-y-4 mt-4 h-fit">{main}</div>
            <div className="bg-white mt-4 lg:sticky lg:p-0 lg:top-8">
                <div className="grid gap-y-4 h-fit">{side}</div>
            </div>
        </div>
    </>
);
