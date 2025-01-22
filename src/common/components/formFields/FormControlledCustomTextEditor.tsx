import { CustomTextareaEditor } from "@common/components/CustomEditor";
import React from "react";
import { useController, useFormContext } from "react-hook-form";

export function FormControlledCustomTextareaEditor({
    name,
    label,
    description,
    className,
    resize,
    readOnly,
}: {
    name?: string;
    label?: string;
    description?: string;
    className?: string;
    resize?: boolean;
    readOnly?: boolean;
}) {
    const { setValue, trigger, control } = useFormContext();
    const { field } = useController({ name, control });

    function onChange(value: string) {
        setValue(name, value);
        trigger(name);
    }

    return (
        <CustomTextareaEditor
            name={name}
            value={field.value}
            onChange={onChange}
            readOnly={readOnly}
            label={label}
            description={description}
            className={className}
            resize={resize}
        />
    );
}
