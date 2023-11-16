import { BidragCell, BidragGrid, SaveStatusIndicator } from "@navikt/bidrag-ui-common";
import { Heading } from "@navikt/ds-react";
import React from "react";

import { useForskudd } from "../../../context/ForskuddContext";
import { MutationKeys } from "../../../hooks/useApiData";

export const FormLayout = ({ title, main, side }) => {
    const { behandlingId } = useForskudd();
    return (
        <>
            <div className="flex flex-row gap-2">
                <Heading level="2" size="xlarge">
                    {title}
                </Heading>
                <SaveStatusIndicator mutationKey={MutationKeys.updateBoforhold(behandlingId)} />
            </div>

            <BidragGrid className="grid grid-cols-12 gap-6">
                <BidragCell className="sm:col-span-12 md:col-span-12 xl:col-span-12 2xl:col-span-8 mt-4 h-fit grid gap-y-4">
                    {main}
                </BidragCell>
                <BidragCell className="sm:col-span-12 md:col-span-6 xl:col-span-6 2xl:col-span-4 mt-4 bg-white">
                    <div className="grid gap-y-4 h-fit lg:sticky lg:top-8 lg:p-0">{side}</div>
                </BidragCell>
            </BidragGrid>
        </>
    );
};
