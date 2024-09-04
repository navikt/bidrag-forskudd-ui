import "./sideMenu.css";

import {
    BellDotIcon,
    CheckmarkIcon,
    ChevronLeftCircleIcon,
    ExclamationmarkTriangleFillIcon,
} from "@navikt/aksel-icons";
import { Button, VStack } from "@navikt/ds-react";
import { scrollToHash } from "@utils/window-utils";
import React, { ReactNode, useState } from "react";

export const MenuButton = ({
    completed,
    step,
    title,
    onStepChange,
    interactive,
    subMenu,
    size,
    active,
    valideringsfeil,
    unconfirmedUpdates,
}: {
    completed?: boolean;
    step?: string;
    title: string;
    onStepChange: () => void;
    interactive?: boolean;
    subMenu?: ReactNode;
    size?: "small" | "medium" | "xsmall";
    active: boolean;
    valideringsfeil?: boolean;
    unconfirmedUpdates?: boolean;
}) => {
    const onClick = () => {
        onStepChange();
        scrollToHash();
    };

    return (
        <>
            <Button
                variant="tertiary"
                className={`grid-item w-full justify-start rounded-none py-3 px-5 ${
                    active ? "bg-[var(--a-blue-50)]" : ""
                }`}
                onClick={onClick}
                disabled={!interactive}
                size={size ?? "medium"}
            >
                <span className="flex items-center gap-1 h-5">
                    <span className="w-5">
                        {((unconfirmedUpdates && !active) || (unconfirmedUpdates && !subMenu)) && (
                            <BellDotIcon title="Info" />
                        )}
                    </span>
                    <span className="w-5">
                        {completed && <CheckmarkIcon title="Checked" />}
                        {((valideringsfeil && !active) || (valideringsfeil && !subMenu)) && (
                            <ExclamationmarkTriangleFillIcon
                                title="Advarsel"
                                style={{ color: "var(--ac-alert-icon-warning-color, var(--a-icon-warning))" }}
                            />
                        )}
                    </span>
                    <span className="w-5">{step && step}</span>
                    <span className={`text-left ${!subMenu && size === "small" ? "font-normal" : ""}`}>{title}</span>
                </span>
            </Button>
            {active && subMenu}
        </>
    );
};
export const SideMenu = ({ children }) => {
    const [menuOpen, setMenuOpen] = useState<boolean>(true);
    const closedMenuCss = "p-0 w-0 min-w-0";
    const openMenuCss = "p-6 min-w-[248px]";

    return (
        <div
            className={`top-0 z-10 h-screen sticky border-solid border-0 border-r-2 border-r-blue-400 max-w-[412px] ${
                menuOpen ? openMenuCss : closedMenuCss
            }`}
        >
            {menuOpen && (
                <VStack gap="0" className="grid overflow-hidden border border-solid border-[var(--a-border-divider)]">
                    {children}
                </VStack>
            )}
            <Button
                className={`absolute right-[-1rem] top-[40%] p-0 rounded-full bg-white z-10 duration-500 ${
                    !menuOpen ? "rotate-180" : "rotate-0"
                }`}
                variant="tertiary"
                icon={<ChevronLeftCircleIcon title="sidebar-button" fontSize="2rem" />}
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
            />
        </div>
    );
};
