import React from "react";
import { useController, useFormContext } from "react-hook-form";

import { DatePickerInput } from "../date-picker/DatePickerInput";

export const FormControlledDatePicker = ({ name, label, defaultValue, placeholder, hideLabel }) => {
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
        />
    );
};
