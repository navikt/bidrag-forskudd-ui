import { MonthValidationT } from "@navikt/ds-react";
import React from "react";
import { useController, useFormContext } from "react-hook-form";

import { lastDayOfMonth } from "../../utils/date-utils";
import { MonthPicker } from "../date-picker/MonthPicker";

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
    toDate?: Date;
    lastDayOfMonthPicker?: boolean;
}

export const FormControlledMonthPicker = ({
    name,
    label,
    defaultValue,
    placeholder,
    hideLabel,
    className,
    resetDefaultValue,
    required,
    onChange,
    toDate,
    lastDayOfMonthPicker,
}: FormControlledDatePickerProps) => {
    const { control, setError, clearErrors } = useFormContext();
    const { field, fieldState } = useController({ name, control, rules: { required: required } });

    const handleChange = (date: Date) => {
        if (date) {
            let dateToSave = date;
            if (lastDayOfMonthPicker) dateToSave = lastDayOfMonth(dateToSave);
            field.onChange(dateToSave);
            clearErrors(name);
        }
        if (onChange) {
            onChange(date);
        }
    };

    const onValidate = (monthValidation: MonthValidationT) => {
        if (required && monthValidation.isEmpty) {
            setError(name, { type: "required", message: "Dato må fylles ut" });
        } else if (!monthValidation.isValidMonth) {
            setError(name, { type: "notValid", message: "Dato er ikke gylid" });
        }
    };

    return (
        <MonthPicker
            label={label}
            placeholder={placeholder}
            onChange={(value) => handleChange(value)}
            defaultValue={defaultValue}
            hideLabel={hideLabel}
            className={className}
            resetDefaultValue={resetDefaultValue}
            error={fieldState?.error?.message}
            onValidate={onValidate}
            toDate={toDate}
        />
    );
};
