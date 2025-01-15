import { BodyLong, BodyShort, Label } from "@navikt/ds-react";
import { useFormContext } from "react-hook-form";
import { EditorProvider, Editor, Toolbar, BtnBold, BtnItalic, BtnStyles, Separator, createButton, createDropdown, useEditorState, Dropdown, } from "react-simple-wysiwyg";
import React, { useRef } from "react";
import { CustomQuillEditor } from "./CustomQuillEditor";
const BtnCustomStyles = createDropdown2('Formattering', [
    ['Normal', 'formatBlock', 'DIV'],
    ['Overskrift 1', "formatBlock", 'H1'],
    ['Overskrift 2', 'formatBlock', 'H2'],
]);
function createDropdown2(title, items) {
    DropdownFactory.displayName = title;
    return DropdownFactory;
    function DropdownFactory() {
        var editorState = useEditorState();
        const ref = useRef(null);
        var $el = editorState.$el, $selection = editorState.$selection, htmlMode = editorState.htmlMode;
        if (htmlMode) {
            return null;
        }
        var activeIndex = items.findIndex(function (item) { return item[1] === 'formatBlock' && ($selection === null || $selection === void 0 ? void 0 : $selection?.parentElement?.nodeName) === item[2]; });
        return <select className="rsw-dd" value={activeIndex == -1 ? ref.current?.value ?? -1 : activeIndex} onChange={onChange} ref={ref} tabIndex={-1}>
            <option hidden value={-1}>{title}</option>
            {items.map((item, index) => <option value={index}>{item[0]}</option>)}
        </select>
        function onChange(e) {
            var target = e.target;
            var selectedValue = target.value;
            var selectedIndex = parseInt(selectedValue, 10);
            var _a = items[selectedIndex] || [], command = _a[1], commandArgument = _a[2];
            e.preventDefault();
            if (document.activeElement !== $el) {
                $el === null || $el === void 0 ? void 0 : $el.focus();
            }
            if (typeof command === 'function') {
                command(editorState);
            }
            else if (command) {
                document.execCommand(command, false, commandArgument);
            }
            setTimeout(function () { return (target.value = selectedValue); }, 10);
        }
    }
}
export function CustomEditor({ name, label, description }: { name: string; label?: string; description?: string }) {
    const { watch, setValue } = useFormContext();
    const quillRef = useRef(null);

    function onChange(value: string) {
        setValue(name, value?.replace('<br/>', String.fromCharCode(10)).replace('<br>', String.fromCharCode(10)));
    }
    return <BodyLong size="small" as="div">
        {label && <Label size="small" htmlFor={name}>{label}</Label>}
        {description && <BodyShort spacing textColor="subtle" size="small">{description}</BodyShort>}<CustomQuillEditor
            ref={quillRef}
            readOnly={false}
            defaultValue={watch(name)?.replace(new RegExp(String.fromCharCode(10), 'g'), '<br>')}
            onTextChange={onChange}
        />
    </BodyLong>


}