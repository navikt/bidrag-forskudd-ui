import React from "react";
import { useController, useFormContext } from "react-hook-form";

import { DatePickerRangeStandalone } from "../date-picker/DatePickerRangeStandalone";

export const FormControlledDatePickerRangeStandalone = ({ fromFieldName, toFieldName }) => {
    const {
        control,
        formState: { errors },
    } = useFormContext();

    const { field: from } = useController({ name: fromFieldName, control });
    const { field: to } = useController({ name: toFieldName, control });

    const onChange = (range: { from: Date | null; to?: Date | null }) => {
        from.onChange(range.from);
        to.onChange(range.to);
    };

    return <DatePickerRangeStandalone onSelect={onChange} selected={{ from: from.value, to: to.value }} />;
};
