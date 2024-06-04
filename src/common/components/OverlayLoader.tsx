import { Loader } from "@navikt/ds-react";
import React from "react";

export const OverlayLoader = ({ loading }: { loading: boolean }) => {
    if (!loading) return null;
    return (
        <div className="flex items-center justify-center absolute top-0 bottom-0 w-full bg-[--a-surface-neutral-subtle]">
            <Loader size="medium" title="Lagrer..." />
        </div>
    );
};
