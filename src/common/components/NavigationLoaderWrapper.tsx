import { NavigationLoader } from "@common/components/OverlayLoader";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import React, { PropsWithChildren } from "react";

export const NavigationLoaderWrapper = ({ children }: PropsWithChildren) => {
    const { pendingTransitionState } = useBehandlingProvider();
    return (
        <div className={`${pendingTransitionState ? "relative" : "inherit"} block overflow-x-auto whitespace-nowrap`}>
            <NavigationLoader loading={pendingTransitionState} />
            {children}
        </div>
    );
};
