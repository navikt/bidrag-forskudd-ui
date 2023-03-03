import { UNSAFE_DatePicker, UNSAFE_useRangeDatepicker } from "@navikt/ds-react";
import { useEffect } from "react";

export const DatePickerRange = ({ onChange, defaultValues }) => {
    const { datepickerProps, toInputProps, fromInputProps, setSelected } = UNSAFE_useRangeDatepicker({
        defaultSelected: defaultValues,
        onRangeChange: onChange,
    });

    useEffect(() => {
        if (defaultValues) setSelected(defaultValues);
    }, [defaultValues]);

    return (
        <div className="min-h-96">
            <UNSAFE_DatePicker {...datepickerProps}>
                <div className="flex flex-wrap justify-center gap-4">
                    <UNSAFE_DatePicker.Input {...fromInputProps} label="Fra" size="small" />
                    <UNSAFE_DatePicker.Input {...toInputProps} label="Til" size="small" />
                </div>
            </UNSAFE_DatePicker>
        </div>
    );
};
