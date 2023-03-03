import React from "react";
import { useController, useFormContext } from "react-hook-form";

import { DatePickerRange } from "../date-picker/DatePickerRange";

export const FormControlledDatePickerRange = ({ defaultValues, fromFieldName, toFieldName }) => {
    const {
        control,
        formState: { errors },
    } = useFormContext();

    const { field: periodeFraField } = useController({ name: fromFieldName, control });
    const { field: periodeTilField } = useController({ name: toFieldName, control });

    const onChange = (range: { from: Date | undefined; to?: Date | undefined }) => {
        periodeFraField.onChange(range.from);
        periodeTilField.onChange(range.to);
    };

    return <DatePickerRange onChange={onChange} defaultValues={defaultValues} />;
};
