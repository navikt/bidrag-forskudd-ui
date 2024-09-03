import { Heading } from "@navikt/ds-react";
import React, { ReactNode } from "react";

export const NewFormLayout = ({
    title,
    main,
    side,
    pageAlert,
}: {
    title?: ReactNode;
    main?: ReactNode;
    side?: ReactNode;
    pageAlert?: ReactNode;
}) => {
    return (
        <>
            <div className="flex flex-row gap-2">
                <Heading level="1" size="medium">
                    {title}
                </Heading>
            </div>
            <div className="flex flex-wrap gap-6">
                <div className="min-w-[952px] h-fit grid gap-y-4">
                    {pageAlert}
                    {main}
                </div>
                <div className="flex flex-1 min-w-[248px] bg-white">
                    <div className="w-full h-fit grid gap-y-4 lg:sticky lg:top-8 lg:p-0">{side}</div>
                </div>
            </div>
        </>
    );
};
