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
}

export const FormControlledDatePicker = ({
    name,
    label,
    defaultValue,
    placeholder,
    hideLabel,
    className,
    resetDefaultValue,
}: FormControlledDatePickerProps) => {
    const {
        control,
        formState: { errors },
    } = useFormContext();

    const { field } = useController({ name, control });

    return (
        <DatePickerInput
            label={label}
            placeholder={placeholder}
            onChange={field.onChange}
            defaultValue={defaultValue}
            hideLabel={hideLabel}
            className={className}
            resetDefaultValue={resetDefaultValue}
        />
    );
};
