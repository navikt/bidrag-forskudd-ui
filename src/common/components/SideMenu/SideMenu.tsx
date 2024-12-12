import "./sideMenu.css";

import {
    ArrowsCirclepathIcon,
    BellDotIcon,
    ChevronDownIcon,
    ChevronLeftCircleIcon,
    ExclamationmarkTriangleIcon,
} from "@navikt/aksel-icons";
import { Button, VStack } from "@navikt/ds-react";
import { scrollToHash } from "@utils/window-utils";
import React, { ReactElement, ReactNode, useEffect, useState } from "react";

export const MenuButton = ({
    step,
    title,
    onStepChange,
    subMenu,
    size,
    active,
    valideringsfeil,
    unconfirmedUpdates,
    interactive = true,
}: {
    step?: string;
    title: string | ReactElement;
    onStepChange: () => void;
    interactive?: boolean;
    subMenu?: ReactNode;
    size?: "small" | "medium" | "xsmall";
    active: boolean;
    valideringsfeil?: boolean;
    unconfirmedUpdates?: boolean;
}) => {
    const [openSubMenu, setOpenSubMenu] = useState<boolean>(active);
    const onClick = () => {
        onStepChange();
        scrollToHash();
        setOpenSubMenu(!openSubMenu);
    };

    useEffect(() => {
        setOpenSubMenu(active);
    }, [active]);

    const displayBellIcon = step && (unconfirmedUpdates || valideringsfeil);
    const displayUpdateIcon = (unconfirmedUpdates && !openSubMenu) || (unconfirmedUpdates && !subMenu);
    const displayWarningIcon = (valideringsfeil && !openSubMenu) || (valideringsfeil && !subMenu);

    return (
        <>
            <Button
                variant="tertiary"
                className={`grid-item w-full grid justify-stretch rounded-none py-3 px-5 ${
                    active ? "bg-[var(--a-blue-50)]" : ""
                }`}
                onClick={onClick}
                disabled={!interactive}
                size={size ?? "medium"}
            >
                <span className="grid items-center gap-1 grid-cols-[20px,20px,auto,20px]">
                    <span>
                        {displayBellIcon && <BellDotIcon title="Info" style={{ color: "var(--a-icon-default)" }} />}
                    </span>
                    {!step && (
                        <span>
                            {displayWarningIcon && (
                                <ExclamationmarkTriangleIcon
                                    title="Advarsel"
                                    style={{ color: "var(--a-icon-default)" }}
                                />
                            )}
                            {!displayWarningIcon && displayUpdateIcon && (
                                <ArrowsCirclepathIcon title="Info" style={{ color: "var(--a-icon-default)" }} />
                            )}
                        </span>
                    )}
                    {step && <span>{step}</span>}
                    <span className={`text-left ${!subMenu && size === "small" ? "font-normal" : ""} `}>{title}</span>
                    <span>
                        {subMenu && (
                            <ChevronDownIcon
                                title="submenu"
                                className={`duration-500 ${openSubMenu ? "rotate-180" : "rotate-0"}`}
                            />
                        )}
                    </span>
                </span>
            </Button>
            {active && openSubMenu && subMenu}
        </>
    );
};
export const SideMenu = ({ children }) => {
    const [menuOpen, setMenuOpen] = useState<boolean>(true);
    const closedMenuCss = "p-0 w-6 min-w-0";
    const openMenuCss = "p-6 w-[298px] min-w-[298px] min-[1440px]:w-[412px]";

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
