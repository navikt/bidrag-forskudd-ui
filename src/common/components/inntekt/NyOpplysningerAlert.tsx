import { BehandlingAlert } from "@common/components/BehandlingAlert";
import text from "@common/constants/texts";
import { useGetBehandlingV2 } from "@common/hooks/useApiData";
import { BodyShort, Heading } from "@navikt/ds-react";
import { dateOrNull, DateToDDMMYYYYHHMMString } from "@utils/date-utils";
import React from "react";

export const NyOpplysningerAlert = () => {
    const { ikkeAktiverteEndringerIGrunnlagsdata } = useGetBehandlingV2();
    const ikkeAktiverteEndringer = Object.values(ikkeAktiverteEndringerIGrunnlagsdata.inntekter).filter(
        (i) => i.length > 0
    );

    if (ikkeAktiverteEndringer.length === 0) return null;
    return (
        <BehandlingAlert variant="info">
            <Heading size="xsmall" level="3">
                {text.alert.nyOpplysningerInfo}
            </Heading>
            <BodyShort size="small">
                Nye opplysninger fra offentlige register er tilgjengelig. Oppdatert{" "}
                {DateToDDMMYYYYHHMMString(dateOrNull(ikkeAktiverteEndringer[0][0].innhentetTidspunkt))}.
            </BodyShort>
        </BehandlingAlert>
    );
};
