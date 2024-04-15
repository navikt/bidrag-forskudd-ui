//@ts-ignore
import styles from "./NotatPage.lazy.css";
styles.use();
import { FileIcon, FilePdfIcon } from "@navikt/aksel-icons";
import { Broadcast } from "@navikt/bidrag-ui-common";
import { Alert, Loader, Tabs } from "@navikt/ds-react";
import { useQueryClient } from "@tanstack/react-query";
import React, { Suspense, useEffect, useMemo, useRef } from "react";

import text from "../../constants/texts";
import { QueryKeys, useNotat, useNotatPdf } from "../../hooks/useApiData";
import { notatBroadcastName } from "../../types/notat";
export default ({ behandlingId, pdf = false }: { behandlingId: number; pdf: boolean }) => {
    const [showTab, setShowTab] = React.useState<string>("html");
    return (
        <div className="max-w-[1092px] px-6 py-6">
            <Suspense
                fallback={
                    <div className="flex justify-center">
                        <Loader size="3xlarge" title={text.loading} variant="interaction" />
                    </div>
                }
            >
                <div>
                    <Tabs defaultValue={showTab} onChange={setShowTab}>
                        <Tabs.List>
                            <Tabs.Tab value="html" label="Standard" icon={<FileIcon />} />
                            <Tabs.Tab value="pdf" label="PDF" icon={<FilePdfIcon />} />
                        </Tabs.List>
                        <Tabs.Panel value="pdf" style={{ maxHeight: "calc(100% - 200px)", width: "100%" }}>
                            <RenderNotatPdf behandlingId={behandlingId} />
                        </Tabs.Panel>
                        <Tabs.Panel
                            value="html"
                            style={{ height: "calc(100% - 200px)", width: "100%", overflow: "auto" }}
                        >
                            <RenderNotatHtml behandlingId={behandlingId} />
                        </Tabs.Panel>
                    </Tabs>
                </div>
            </Suspense>
        </div>
    );
};

const RenderNotatPdf = ({ behandlingId }: { behandlingId: number }) => {
    const { data: notatPdf, isLoading, isError } = useNotatPdf(behandlingId);
    const queryClient = useQueryClient();
    const hasSubscribed = useRef<boolean>(false);
    async function subscribeToChanges() {
        console.debug("Waiting for broadcast PDF", notatBroadcastName, behandlingId);
        await Broadcast.waitForBroadcast(notatBroadcastName, behandlingId.toString());
        console.debug("Received broadcast PDF", notatBroadcastName, behandlingId);
        queryClient.refetchQueries({ queryKey: QueryKeys.notatPdf(behandlingId) });
        setTimeout(() => subscribeToChanges(), 200);
    }

    const notatUrl = useMemo(() => getUrl(), [notatPdf]);
    useEffect(() => {
        if (hasSubscribed.current) return;
        subscribeToChanges();
        hasSubscribed.current = true;
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center">
                <Loader size="3xlarge" title={text.loading} variant="interaction" />
            </div>
        );
    }
    if (isError) {
        return <Alert variant="error">{text.error.hentingAvNotat}</Alert>;
    }

    function getUrl() {
        const fileBlob = new Blob([notatPdf], { type: "application/pdf" });
        return URL.createObjectURL(fileBlob);
    }
    return <object data={notatUrl + "#toolbar=0"} type="application/pdf" width="100%" height="85%" />;
};
const RenderNotatHtml = ({ behandlingId }: { behandlingId: number }) => {
    const { data: notatHtml, isLoading, isError } = useNotat(behandlingId);
    const queryClient = useQueryClient();

    async function subscribeToChanges() {
        await Broadcast.waitForBroadcast(notatBroadcastName, behandlingId.toString());
        console.debug("Received broadcast HTML", notatBroadcastName, behandlingId);
        queryClient.refetchQueries({ queryKey: QueryKeys.notat(behandlingId) });
        setTimeout(() => subscribeToChanges(), 200);
    }
    useEffect(() => {
        subscribeToChanges();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center">
                <Loader size="3xlarge" title={text.loading} variant="interaction" />
            </div>
        );
    }
    if (isError) {
        return <Alert variant="error">{text.error.hentingAvNotat}</Alert>;
    }

    //@ts-ignore
    return <notat-view html={notatHtml} />;
};

if (customElements.get("notat-view") == null) {
    customElements.define(
        "notat-view",
        class NotatElement extends HTMLElement {
            static observedAttributes = ["html"];

            private html: string;
            constructor(html: string) {
                super();
                this.html = html;
                this.attachShadow({ mode: "open" });
            }

            connectedCallback() {
                this.render();
            }

            render() {
                if (this.shadowRoot.firstChild) {
                    this.shadowRoot.replaceChild(this.getTemplate(), this.shadowRoot.firstElementChild);
                } else {
                    this.shadowRoot.appendChild(this.getTemplate());
                }
            }
            cleanup() {
                this.shadowRoot.innerHTML = "";
            }
            getTemplate() {
                const template = document.createElement("body");
                template.innerHTML = this.html;
                template.querySelector("#footer")?.remove();
                return template;
            }

            attributeChangedCallback(name: string, oldValue: string, newValue: string) {
                if (name == "html") {
                    this.html = newValue;
                    this.render();
                }
            }
        }
    );
}
