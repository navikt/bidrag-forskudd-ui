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
    resetDefaultValue?: boolean;
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
    resetDefaultValue,
    required,
    onChange,
}: FormControlledDatePickerProps) => {
    const { control, setError, clearErrors } = useFormContext();
    const { field, fieldState } = useController({ name, control, rules: { required: required } });

    const handleChange = (date: Date) => {
        if (date) {
            field.onChange(date);
            clearErrors(name);
        }
        if (onChange) {
            onChange(date);
        }
    };

    const onValidate = (dateValidation: DateValidationT) => {
        if (required && dateValidation.isEmpty) {
            setError(name, { type: "required", message: "Dato må fylles ut" });
        } else if (!dateValidation.isValidDate) {
            setError(name, { type: "notValid", message: "Dato er ikke gylid" });
        }
    };

    return (
        <DatePickerInput
            label={label}
            placeholder={placeholder}
            onChange={(value) => handleChange(value)}
            defaultValue={defaultValue}
            hideLabel={hideLabel}
            className={className}
            resetDefaultValue={resetDefaultValue}
            error={fieldState?.error?.message}
            onValidate={onValidate}
        />
    );
};
