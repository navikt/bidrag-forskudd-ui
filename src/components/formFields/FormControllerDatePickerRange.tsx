import React, { useCallback } from "react";
import { useFormContext } from "react-hook-form";

import { DatePickerRange } from "../date-picker/DatePickerRange";

interface DateRange {
    from: Date | undefined;
    to: Date | undefined;
}

interface Props {
    fromFieldName: string;
    toFieldName: string;
    defaultValues?: DateRange;
    resetDefaultValues?: boolean | undefined;
}
export const FormControlledDatePickerRange = ({
    defaultValues,
    fromFieldName,
    toFieldName,
    resetDefaultValues,
}: Props) => {
    const {
        setValue,
        formState: { errors },
    } = useFormContext();

    const onChange = useCallback((range: { from: Date | null; to?: Date | null }) => {
        setValue(fromFieldName, range.from);
        setValue(toFieldName, range.to);
    }, []);

    return (
        <DatePickerRange onChange={onChange} defaultValues={defaultValues} resetDefaultValues={resetDefaultValues} />
    );
};
