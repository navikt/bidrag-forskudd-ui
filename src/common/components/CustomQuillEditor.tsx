import "quill/dist/quill.snow.css";
import "quill/dist/quill.core.css";
import "./CustomQuillEditor.css";
import "quill-paste-smart";

import Quill from "quill";
import { useEffect, useRef, useState } from "react";

type EditorProps = {
    readOnly: boolean;
    defaultValue: string;
    onTextChange: (html: string) => void;
    resize?: boolean;
    ref;
};
export const CustomQuillEditor = ({ readOnly, defaultValue, onTextChange, ref, resize }: EditorProps) => {
    const containerRef = useRef(null);
    const [quill, setQuill] = useState(null);

    useEffect(() => {
        const textChangeHandler = () => {
            if (quill.getLength() <= 1) {
                onTextChange("");
            } else {
                onTextChange(quill.getSemanticHTML().replaceAll("<p></p>", "<p><br/></p>"));
            }
        };

        if (quill) {
            quill.on(Quill.events.TEXT_CHANGE, textChangeHandler);
        }

        return () => {
            quill?.off(Quill.events.TEXT_CHANGE, textChangeHandler);
        };
    }, [quill, onTextChange]);

    useEffect(() => {
        const container = containerRef.current;
        const editorContainer = container.appendChild(container.ownerDocument.createElement("div"));
        const quillEditor = new Quill(editorContainer, {
            theme: "snow",
            readOnly,
            modules: {
                history: {},

                toolbar: readOnly
                    ? false
                    : {
                          container: [
                              ["bold", "italic", "underline", { header: 3 }],
                              // [{ 'color': "red" }, { 'background': "yellow" }]
                          ],
                      },
                clipboard: {
                    allowed: {
                        tags: ["strong", "h3", "h4", "em", "p", "br", "span", "u"],
                        // attributes: ['href', 'rel', 'target', 'class', "style"]
                        attributes: [],
                    },
                    customButtons: [],
                    keepSelection: true,
                    substituteBlockElements: true,
                    magicPasteLinks: false,
                    removeConsecutiveSubstitutionTags: false,
                },
            },
        });
        setQuill(quillEditor);
        ref.current = quillEditor;

        return () => {
            ref.current = null;
            container.innerHTML = "";
        };
    }, [ref]);

    useEffect(() => {
        if (quill) {
            const currentHTML = quill.getSemanticHTML().replaceAll("<p></p>", "<p><br/></p>");

            if (defaultValue !== currentHTML) {
                const updatedDelta = quill.clipboard.convert({ html: defaultValue });
                quill.setContents(updatedDelta, "silent");
            }
        }
    }, [quill, defaultValue]);

    return (
        <div
            spellCheck={false}
            className={`ql-top-container ${readOnly ? "readonly" : ""} ${resize ? "resizable" : ""}`}
            ref={containerRef}
        ></div>
    );
};
