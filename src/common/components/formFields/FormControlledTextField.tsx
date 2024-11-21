import { BodyShort, TextField } from "@navikt/ds-react";
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
    max,
    step,
    prefix,
    width,
}: {
    name: string;
    label: string;
    hideLabel?: boolean;
    type?: "number" | "email" | "password" | "tel" | "text" | "url";
    disabled?: boolean;
    editable?: boolean;
    prefix?: string;
    min?: string | number;
    max?: string | number;
    step?: string;
    inputMode?: "email" | "tel" | "text" | "url" | "search" | "none" | "numeric" | "decimal";
    width?: string;
}) => {
    const { control, clearErrors } = useFormContext();
    const { field, fieldState } = useController({ name, control });
    const { lesemodus } = useBehandlingProvider();

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        clearErrors(name);
        if (inputMode === "numeric") {
            field.onChange(Number(Number(e.target.value).toFixed()));
        } else if (inputMode === "decimal") {
            const fractionalPart = e.target.value.split(".")?.[1];
            const secondFractionalDigit = fractionalPart?.[1];
            const numberOfFractionalDigits = secondFractionalDigit ? 2 : 1;
            field.onChange(Number.parseFloat(e.target.value).toFixed(fractionalPart ? numberOfFractionalDigits : 0));
        } else {
            field.onChange(e.target.value);
        }
    };

    if (!editable) {
        const value = prefix ? `${prefix}${field.value ? `, ${field.value}` : ""}` : field.value;
        return (
            <div className={`min-h-8 flex items-center ${type === "number" ? "justify-end" : ""}`}>
                <BodyShort size="small">{value}</BodyShort>
            </div>
        );
    }

    return (
        <TextField
            type={type}
            label={label}
            size="small"
            readOnly={lesemodus}
            value={field?.value?.toString() ?? ""}
            onChange={(value) => onChange(value)}
            hideLabel={hideLabel}
            disabled={disabled}
            error={fieldState?.error?.message}
            min={min}
            max={max}
            style={width ? { width: width } : undefined}
            step={step}
            inputMode={inputMode}
            onKeyDown={(e) => {
                if (inputMode === "numeric" && [",", "."].includes(e.key)) {
                    e.preventDefault();
                }
            }}
        />
    );
};
