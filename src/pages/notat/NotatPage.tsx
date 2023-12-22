import { Broadcast } from "@navikt/bidrag-ui-common";
import { Alert, Loader } from "@navikt/ds-react";
import { useQueryClient } from "@tanstack/react-query";
import React, { Suspense, useEffect } from "react";

import { QueryKeys, useNotat } from "../../hooks/useApiData";
import { notatBroadcastName } from "../../types/notat";

export default ({ behandlingId }: { behandlingId: number }) => {
    return (
        <div className="max-w-[1092px] mx-auto px-6 py-6">
            <Suspense
                fallback={
                    <div className="flex justify-center">
                        <Loader size="3xlarge" title="venter..." variant="interaction" />
                    </div>
                }
            >
                <RenderNotatHtml behandlingId={behandlingId} />
            </Suspense>
        </div>
    );
};

const RenderNotatHtml = ({ behandlingId }: { behandlingId: number }) => {
    const { data: notatHtml, isLoading, isError } = useNotat(behandlingId);
    const queryClient = useQueryClient();

    async function subscribeToChanges() {
        await Broadcast.waitForBroadcast(notatBroadcastName, behandlingId.toString());
        console.debug("Received broadcast", notatBroadcastName, behandlingId);
        queryClient.refetchQueries({ queryKey: QueryKeys.notat(behandlingId) });
        setTimeout(() => subscribeToChanges(), 200);
    }
    useEffect(() => {
        subscribeToChanges();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center">
                <Loader size="3xlarge" title="venter..." variant="interaction" />
            </div>
        );
    }
    if (isError) {
        return <Alert variant="error">Det skjedde en feil ved henting av notat</Alert>;
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
