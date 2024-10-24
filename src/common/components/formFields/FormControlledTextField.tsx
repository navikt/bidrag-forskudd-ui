import { TextField } from "@navikt/ds-react";
import React from "react";
import { useController, useFormContext } from "react-hook-form";

import { useBehandlingProvider } from "../../context/BehandlingContext";

export const FormControlledTextField = ({
    name,
    label,
    hideLabel,
    type,
    disabled,
    min,
    editable = true,
    inputMode,
    prefix,
}: {
    name: string;
    label: string;
    hideLabel?: boolean;
    type?: "number" | "email" | "password" | "tel" | "text" | "url";
    disabled?: boolean;
    editable?: boolean;
    prefix?: string;
    min?: string | number;
    inputMode?: "email" | "tel" | "text" | "url" | "search" | "none" | "numeric" | "decimal";
}) => {
    const { control, clearErrors } = useFormContext();
    const { field, fieldState } = useController({ name, control });
    const { lesemodus } = useBehandlingProvider();

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        clearErrors(name);
        if (type === "number") {
            field.onChange(Number(e.target.value));
        } else {
            field.onChange(e.target.value);
        }
    };

    if (!editable) {
        const value = prefix ? `${prefix}${field.value ? `, ${field.value}` : ""}` : field.value;
        return <div className={`min-h-8 flex items-center ${type === "number" ? "justify-end" : ""}`}>{value}</div>;
    }

    return (
        <TextField
            type={type}
            label={label}
            size="small"
            readOnly={lesemodus}
            value={field?.value ?? ""}
            onChange={(value) => onChange(value)}
            hideLabel={hideLabel}
            disabled={disabled}
            error={fieldState?.error?.message}
            min={min}
            inputMode={inputMode}
        />
    );
};
