import { Heading, Loader, Modal } from "@navikt/ds-react";
import { CopyToClipboard } from "@navikt/ds-react-internal";
import React, { memo, Suspense, useMemo, useState } from "react";

import { RolleType } from "../../api/BidragBehandlingApi";
import { useForskudd } from "../../context/ForskuddContext";
import { _updateBehandlingExtended, useGetBehandling, usePersonsQueries } from "../../hooks/useApiData";
import { IRolleUI } from "../../types/rolle";
import { RolleDetaljer } from "../RolleDetaljer";
import { UpdateForskudd } from "../UpdateForskudd";

export const ForskuddHeader = memo(() => {
    const { behandlingId } = useForskudd();
    const {
        data: { data: behandling },
    } = useGetBehandling(behandlingId);

    const personsQueries = usePersonsQueries(behandling.roller);
    const personQueriesSuccess = personsQueries.every((query) => query.isSuccess);
    const rollerMedPersonNavn = useMemo(
        () =>
            personQueriesSuccess
                ? behandling.roller.map((rolle) => ({
                      ...rolle,
                      navn:
                          personsQueries.find((query) => rolle.ident === query.data.data.ident)?.data.data.navn ||
                          "UKJENT",
                  }))
                : [],
        [behandling.roller, personQueriesSuccess]
    );

    const mutation = _updateBehandlingExtended(behandlingId);
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <Suspense
            fallback={
                <div className="flex justify-center">
                    <Loader size="3xlarge" title="venter..." variant="interaction" />
                </div>
            }
        >
            <div className="bg-[var(--a-gray-50)] border-[var(--a-border-divider)] border-solid border-b">
                <Heading
                    level="1"
                    size="xlarge"
                    className="px-6 py-2 leading-10 flex items-center gap-x-4 border-[var(--a-border-divider)] border-solid border-b"
                    onDoubleClick={() => {
                        setModalOpen(true);
                    }}
                >
                    Søknad om forskudd <Saksnummer saksnummer={behandling.saksnummer} />
                </Heading>
                <div className="grid grid-cols-[max-content_auto]">
                    <Roller roller={rollerMedPersonNavn} />
                </div>
            </div>

            <Modal
                open={modalOpen}
                aria-label="Oppdatter søknad"
                onClose={() => setModalOpen(!modalOpen)}
                aria-labelledby="modal-heading"
            >
                <Modal.Content>
                    <Heading spacing level="1" size="large" id="modal-heading">
                        Laborum proident id ullamco
                    </Heading>
                    <UpdateForskudd
                        behandling={behandling}
                        mutation={mutation}
                        close={() => {
                            setModalOpen(!modalOpen);
                        }}
                    />
                </Modal.Content>
            </Modal>
        </Suspense>
    );
});

const Roller = memo(({ roller }: { roller: IRolleUI[] }) => (
    <>
        {roller
            .sort((a, b) => {
                if (a.rolleType === RolleType.BIDRAGS_MOTTAKER || b.rolleType === RolleType.BARN) return -1;
                if (b.rolleType === RolleType.BIDRAGS_MOTTAKER || a.rolleType === RolleType.BARN) return 1;
                return 0;
            })
            .map((rolle, i) => (
                <RolleDetaljer key={rolle.ident + i} rolle={rolle} withBorder={false} />
            ))}
    </>
));

const Saksnummer = memo(({ saksnummer }: { saksnummer: string }) => (
    <span className="text-base flex items-center font-normal">
        Saksnr. {saksnummer} <CopyToClipboard size="small" copyText={saksnummer} popoverText="Kopierte saksnummer" />
    </span>
));
