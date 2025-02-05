import { ExpandIcon, PadlockLockedFillIcon } from "@navikt/aksel-icons";
import { BodyLong, BodyShort, Button, Label } from "@navikt/ds-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useBehandlingProvider } from "../context/BehandlingContext";
import { CustomQuillEditor } from "./CustomQuillEditor";

export const reformatText = (text?: string) => {
    return text?.replace(new RegExp(String.fromCharCode(10), "g"), "<br>");
};

export function CustomTextareaEditor({
    name,
    value,
    label,
    description,
    className,
    resize,
    readOnly,
    onChange,
    withOpenInNewWindow,
}: {
    name;
    value?: string;
    label?: string;
    description?: string;
    className?: string;
    resize?: boolean;
    readOnly?: boolean;
    onChange?: (html: string) => void;
    withOpenInNewWindow?: boolean;
}) {
    const { lesemodus } = useBehandlingProvider();
    const [openInNewWindow, setOpenInNewWindow] = useState<boolean>(false);
    const quillRef = useRef(null);
    const broadcastChannelUUID = useMemo(() => crypto.randomUUID(), []);
    const channel = useMemo(() => new BroadcastChannel(broadcastChannelUUID), [broadcastChannelUUID]);
    const reformattedValue = useMemo(() => reformatText(value), [value]);

    useEffect(() => {
        channel.onmessage = (event) => {
            switch (event.data.action) {
                case "textChange":
                    onChange?.(event.data.value);
                    break;
                case "componentUnmounted":
                    setOpenInNewWindow(false);
                    break;
            }
        };

        return () => channel.postMessage({ action: "componentUnmounted" });
    }, []);

    const onTextChange = useCallback(
        (text: string) => {
            onChange?.(text);
            if (openInNewWindow) {
                channel.postMessage({ action: "textChange", value: reformatText(text) });
            }
        },
        [openInNewWindow]
    );

    const onOpenInNewWindow = useCallback(() => {
        if (openInNewWindow) return;

        setOpenInNewWindow(true);
        window.open(
            `${window.location.pathname}begrunnelse/${broadcastChannelUUID}?value=${encodeURIComponent(reformattedValue)}&label=${label}${description ? `&description=${description}` : ""}`,
            "_blank",
            "width=800,height=700,left=200,top=200"
        );
    }, [openInNewWindow]);

    return (
        <>
            <BodyLong size="small" as="div" className={className}>
                {label && (
                    <Label className="flex items-center gap-2" spacing size="small" htmlFor={name}>
                        {(lesemodus || readOnly) && <PadlockLockedFillIcon />} {label}{" "}
                        {!withOpenInNewWindow && (
                            <Button
                                size="xsmall"
                                variant="tertiary-neutral"
                                icon={<ExpandIcon title="Ny fane" />}
                                onClick={onOpenInNewWindow}
                                type="button"
                            />
                        )}
                    </Label>
                )}

                {description && (
                    <BodyShort spacing textColor="subtle" size="small" className="max-w-[500px] mt-[-0.375rem]">
                        {description}
                    </BodyShort>
                )}
                <CustomQuillEditor
                    ref={quillRef}
                    resize={resize}
                    readOnly={lesemodus || readOnly}
                    defaultValue={reformattedValue}
                    onTextChange={onTextChange}
                />
            </BodyLong>
        </>
    );
}
