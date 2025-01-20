import { PadlockLockedFillIcon } from "@navikt/aksel-icons";
import { BodyLong, BodyShort, Label } from "@navikt/ds-react";
import React, { useRef } from "react";

import { useBehandlingProvider } from "../context/BehandlingContext";
import { CustomQuillEditor } from "./CustomQuillEditor";

export function CustomTextareaEditor({
    name,
    value,
    label,
    description,
    className,
    resize,
    readOnly,
    onChange,
}: {
    name;
    value?: string;
    label?: string;
    description?: string;
    className?: string;
    resize?: boolean;
    readOnly?: boolean;
    onChange?: (html: string) => void;
}) {
    const { lesemodus } = useBehandlingProvider();

    const quillRef = useRef(null);

    function onTextChange(text: string) {
        onChange?.(text);
    }

    function reformatText(text?: string) {
        return text?.replace(new RegExp(String.fromCharCode(10), "g"), "<br>");
    }
    return (
        <BodyLong size="small" as="div" className={className}>
            {label && (
                <Label className="flex items-center gap-2" spacing size="small" htmlFor={name}>
                    {(lesemodus || readOnly) && <PadlockLockedFillIcon />} {label}
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
                defaultValue={reformatText(value)}
                onTextChange={onTextChange}
            />
        </BodyLong>
    );
}
