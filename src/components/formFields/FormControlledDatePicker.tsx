import { DateValidationT } from "@navikt/ds-react";
import React from "react";
import { useController, useFormContext } from "react-hook-form";

import { DatePickerInput } from "../date-picker/DatePickerInput";

interface FormControlledDatePickerProps {
    name: string;
    label: string;
    defaultValue: Date | null;
    placeholder: string;
    hideLabel?: boolean;
    className?: string;
    required?: boolean;
    onChange?: (date: Date | undefined) => void;
}

export const FormControlledDatePicker = ({
    name,
    label,
    defaultValue,
    placeholder,
    hideLabel,
    className,
    required,
    onChange,
}: FormControlledDatePickerProps) => {
    const { control, setError, clearErrors } = useFormContext();
    const { field, fieldState } = useController({
        name,
        control,
        rules: {
            required: required ? "Dato må fylles ut" : false,
        },
    });

    const handleChange = (date: Date) => {
        if (date) {
            clearErrors(name);
        }
        field.onChange(date);
        if (onChange) {
            onChange(date);
        }
    };

    const onValidate = (dateValidation: DateValidationT) => {
        if (!dateValidation.isValidDate && !dateValidation.isEmpty) {
            setError(name, { type: "notValid", message: "Dato er ikke gylid" });
            return;
        }
        clearErrors(name);
    };

    return (
        <DatePickerInput
            label={label}
            placeholder={placeholder}
            onChange={(value) => handleChange(value)}
            defaultValue={defaultValue}
            hideLabel={hideLabel}
            className={className}
            error={fieldState?.error?.message}
            onValidate={onValidate}
        />
    );
};
