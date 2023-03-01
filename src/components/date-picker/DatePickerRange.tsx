import { UNSAFE_DatePicker, UNSAFE_useRangeDatepicker } from "@navikt/ds-react";

export const DatePickerRange = () => {
    const { datepickerProps, toInputProps, fromInputProps } = UNSAFE_useRangeDatepicker({
        fromDate: new Date("Aug 23 2019"),
        onRangeChange: console.log,
    });

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
