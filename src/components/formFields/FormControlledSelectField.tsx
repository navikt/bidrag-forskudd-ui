import { Select } from "@navikt/ds-react";
import React from "react";
import { useController, useFormContext } from "react-hook-form";

interface Option {
    value: string;
    text: string;
}

interface FormControlledSelectFieldProps {
    name: string;
    label: string;
    options: Option[];
    hideLabel?: boolean;
    className?: string;
}

export const FormControlledSelectField = ({
    name,
    label,
    options,
    hideLabel,
    className,
}: FormControlledSelectFieldProps) => {
    const {
        control,
        formState: { errors },
    } = useFormContext();

    const { field } = useController({ name, control });

    return (
        <Select
            label={label}
            className={`w-52 ${className}`}
            size="small"
            value={field.value}
            onChange={field.onChange}
            hideLabel={hideLabel}
        >
            {options.map((option) => (
                <option key={option.text} value={option.value}>
                    {option.text}
                </option>
            ))}
        </Select>
    );
};
