import { forwardRef, useRef, useLayoutEffect, useEffect } from "react";

import Quill, { Delta, EmitterSource, Range, Module } from "quill";
import "quill/dist/quill.snow.css";
import "./CustomQuillEditor.css";
import 'quill-paste-smart';

type EditorProps = { readOnly: boolean, defaultValue: string, onTextChange: (html: string) => void, ref }
export const CustomQuillEditor = ({ readOnly, defaultValue, onTextChange, ref }: EditorProps) => {
    const containerRef = useRef(null);


    useEffect(() => {
        ref.current?.enable(!readOnly);
        if (containerRef.current.querySelector('.ql-container')) {
            new ResizeObserver((e) => {
                // console.log(e)
                // containerRef.current.querySelector('.ql-container').style.height = "inherit";
                // containerRef.current.querySelector('.ql-container').style.width = "100%";
            }).observe(containerRef.current.querySelector('.ql-container'));
        }
    }, [ref, readOnly, containerRef.current?.querySelector('.ql-container')]);

    useEffect(() => {
        const container = containerRef.current;
        const editorContainer = container.appendChild(
            container.ownerDocument.createElement('div'),
        );
        const quill = new Quill(editorContainer, {
            theme: 'snow',
            modules: {
                toolbar: [
                    [{ 'header': 3 }, { 'header': 4 }],
                    ['bold', 'italic', 'underline'],
                    // [{ 'color': "red" }, { 'background': "yellow" }]
                ],
                clipboard: {
                    allowed: {
                        tags: ['strong', 'h3', 'h4', 'em', 'p', 'br', 'span', 'u'],
                        // attributes: ['href', 'rel', 'target', 'class', "style"]
                        attributes: []
                    },
                    customButtons: [],
                    keepSelection: true,
                    substituteBlockElements: true,
                    magicPasteLinks: false,
                    removeConsecutiveSubstitutionTags: false

                }
            },
        });

        ref.current = quill;

        if (defaultValue) {
            var delta = quill.clipboard.convert({ html: defaultValue });
            quill.setContents(delta, 'silent');
        }


        quill.on(Quill.events.TEXT_CHANGE, (...args) => {

            onTextChange(quill.getSemanticHTML());
        });


        return () => {
            ref.current = null;
            container.innerHTML = '';
        };
    }, [ref]);

    return <div className="ql-top-container" ref={containerRef} onResize={(e) => console.log(e)}></div>;
}
