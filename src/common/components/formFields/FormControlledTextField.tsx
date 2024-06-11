import { TextField } from "@navikt/ds-react";
import React from "react";
import { useController, useFormContext } from "react-hook-form";

export const FormControlledTextField = ({
    name,
    label,
    hideLabel,
    type,
    disabled,
    min,
    inputMode,
}: {
    name: string;
    label: string;
    hideLabel?: boolean;
    type?: "number" | "email" | "password" | "tel" | "text" | "url";
    disabled?: boolean;
    min?: string | number;
    inputMode?: "email" | "tel" | "text" | "url" | "search" | "none" | "numeric" | "decimal";
}) => {
    const { control } = useFormContext();
    const { field } = useController({ name, control });

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (type === "number") {
            field.onChange(Number(e.target.value));
        } else {
            field.onChange(e.target.value);
        }
    };

    return (
        <TextField
            type={type}
            label={label}
            size="small"
            value={field.value?.toString()}
            onChange={(value) => onChange(value)}
            hideLabel={hideLabel}
            disabled={disabled}
            min={min}
            inputMode={inputMode}
        />
    );
};
