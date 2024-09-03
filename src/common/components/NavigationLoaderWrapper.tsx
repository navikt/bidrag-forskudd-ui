import { NavigationLoader } from "@common/components/OverlayLoader";
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import React, { PropsWithChildren } from "react";

export const NavigationLoaderWrapper = ({ children }: PropsWithChildren) => {
    const { pendingTransitionState } = useBehandlingProvider();
    return (
        <div className={`${pendingTransitionState ? "relative overflow-hidden block whitespace-nowrap" : "inherit"}`}>
            <NavigationLoader loading={pendingTransitionState} />
            {children}
        </div>
    );
};
