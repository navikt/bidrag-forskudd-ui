import { Select } from "@navikt/ds-react";
import React, { PropsWithChildren } from "react";
import { useController, useFormContext } from "react-hook-form";

interface Option {
    value: string;
    text: string;
}

interface FormControlledSelectFieldProps {
    name: string;
    label: string;
    options?: Option[];
    hideLabel?: boolean;
    className?: string;
    onSelect?: (value: string) => void;
}

export const FormControlledSelectField = ({
    name,
    label,
    options,
    hideLabel,
    className,
    onSelect,
    children,
}: PropsWithChildren<FormControlledSelectFieldProps>) => {
    const { control } = useFormContext();
    const { field, fieldState } = useController({ name, control });

    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        field.onChange(e.target.value);
        onSelect?.(e.target.value);
    };

    return (
        <Select
            label={label}
            className={`w-52 ${className}`}
            size="small"
            value={field.value}
            onChange={(e) => onChange(e)}
            hideLabel={hideLabel}
            error={fieldState?.error?.message}
        >
            {children ||
                options.map((option) => (
                    <option key={option.text} value={option.value}>
                        {option.text}
                    </option>
                ))}
        </Select>
    );
};
