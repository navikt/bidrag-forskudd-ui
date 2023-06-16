import { Checkbox, CheckboxGroup } from "@navikt/ds-react";
import React from "react";
import { useController, useFormContext } from "react-hook-form";

export const FormControlledCheckboxGroup = ({
    name,
    legend,
    options,
    hideLegend,
    onChange,
}: {
    name: string;
    legend: string;
    hideLegend?: boolean;
    options: { text: string; value: any }[];
    onChange?: (value: any) => void;
}) => {
    const {
        control,
        formState: { errors },
    } = useFormContext();

    const { field } = useController({ name, control });

    const handleOnChange = (value) => {
        if (onChange) {
            onChange(value);
        }
        field.onChange(value);
    };

    return (
        <CheckboxGroup
            legend={legend}
            hideLegend={hideLegend}
            value={field.value}
            onChange={handleOnChange}
            size="small"
        >
            {options.map((option) => (
                <Checkbox key={option.text} value={option.value}>
                    {option.text}
                </Checkbox>
            ))}
        </CheckboxGroup>
    );
};
