import "quill/dist/quill.snow.css";
import "quill/dist/quill.core.css";
import "./CustomQuillEditor.css";
import "quill-paste-smart";

import Quill from "quill";
import { useEffect, useRef } from "react";

const Clipboard = Quill.import("modules/clipboard");

class CustomClipboard extends Clipboard {
    onCaptureCopy(e: ClipboardEvent) {
        const range = this.quill.getSelection();
        if (range == null) return;

        const text = this.quill.getText(range);
        const html = this.quill.getSemanticHTML(range);
        const styledHtml = this.applyStyles(html);

        e.clipboardData.setData("text/plain", text);
        e.clipboardData.setData("text/html", styledHtml);
        console.log(text);
        console.log(styledHtml);
        e.preventDefault();
    }
    applyStyles(html: string): string {
        // Create a container and fill it with the copied HTML.
        const container = document.createElement("div");
        container.innerHTML = html;

        // Apply general styles for font family and line height.
        container.style.fontFamily = "Times New Roman";
        container.style.lineHeight = "1";

        // For p, strong, and i elements, apply a font size of 11px.
        const elements = container.querySelectorAll("p, strong, i, em");
        elements.forEach((el) => {
            el.style.fontSize = "11px";
        });

        return container.innerHTML;
    }
}

Quill.register("modules/clipboard", CustomClipboard, true);
type EditorProps = {
    readOnly: boolean;
    defaultValue: string;
    onTextChange: (html: string) => void;
    resize?: boolean;
    ref;
};
export const CustomQuillEditor = ({ readOnly, defaultValue, onTextChange, ref, resize }: EditorProps) => {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        const editorContainer = container.appendChild(container.ownerDocument.createElement("div"));
        const quill = new Quill(editorContainer, {
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

        ref.current = quill;

        if (defaultValue) {
            const delta = quill.clipboard.convert({ html: defaultValue });
            quill.setContents(delta, "silent");
            quill.history.clear();
        }

        quill.on(Quill.events.TEXT_CHANGE, () => {
            if (quill.getLength() <= 1) {
                onTextChange("");
            } else {
                onTextChange(quill.getSemanticHTML().replaceAll("<p></p>", "<p><br/></p>"));
            }
        });

        return () => {
            ref.current = null;
            container.innerHTML = "";
        };
    }, [ref]);

    return (
        <div
            className={`ql-top-container ${readOnly ? "readonly" : ""} ${resize ? "resizable" : ""}`}
            ref={containerRef}
        ></div>
    );
};
