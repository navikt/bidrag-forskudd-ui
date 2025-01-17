import { PadlockLockedFillIcon } from "@navikt/aksel-icons";
import { BodyLong, BodyShort, Label } from "@navikt/ds-react";
import React, { useRef } from "react";
import { useFormContext } from "react-hook-form";

import { useBehandlingProvider } from "../context/BehandlingContext";
import { CustomQuillEditor } from "./CustomQuillEditor";

export function CustomTextareaEditor({
    name,
    label,
    description,
    className,
    resize,
}: {
    name: string;
    label?: string;
    description?: string;
    className?: string;
    resize?: boolean;
}) {
    const { watch, setValue, trigger } = useFormContext();
    const { lesemodus } = useBehandlingProvider();

    const quillRef = useRef(null);

    function onChange(value: string) {
        setValue(name, value);
        trigger(name);
    }

    function reformatText(text?: string) {
        return text?.replace(new RegExp(String.fromCharCode(10), "g"), "<br>");
    }
    return (
        <BodyLong size="small" as="div" className={className}>
            <div className="flex items-center gap-2">
                {lesemodus && <PadlockLockedFillIcon />}
                {label && (
                    <Label spacing size="small" htmlFor={name}>
                        {label}
                    </Label>
                )}
            </div>
            {description && (
                <BodyShort spacing textColor="subtle" size="small" className="max-w-[500px] mt-[-0.375rem]">
                    {description}
                </BodyShort>
            )}
            <CustomQuillEditor
                ref={quillRef}
                resize={resize}
                readOnly={lesemodus}
                defaultValue={reformatText(watch(name))}
                onTextChange={onChange}
            />
        </BodyLong>
    );
}
