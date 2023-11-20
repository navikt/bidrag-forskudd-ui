import { BehandlingDto, Behandlingstype, RolleDtoRolleType } from "../api/BidragBehandlingApi";
import { OpprettBehandlingsreferanseRequestDto, OpprettGrunnlagRequestDto } from "../api/BidragVedtakApi";
import { PersonDto } from "../api/PersonApi";
import { mapRolle } from "../types/rolle";

export function mapGrunnlagPersonInfo(behandling: BehandlingDto, rolleInfo: PersonDto[]): OpprettGrunnlagRequestDto[] {
    //TODO: Skal barninfo legges til med navn osv?
    const rollerForskudd = [RolleDtoRolleType.BIDRAGSMOTTAKER];
    const rollerSoknad = [
        RolleDtoRolleType.BIDRAGSMOTTAKER,
        RolleDtoRolleType.BIDRAGSPLIKTIG,
        RolleDtoRolleType.REELMOTTAKER,
    ];
    const hentPersonInfoForRoller =
        behandling.behandlingtype == Behandlingstype.FORSKUDD ? rollerForskudd : rollerSoknad;
    return behandling.roller
        .filter((rolle) => hentPersonInfoForRoller.includes(rolle.rolleType))
        .map((rolle) => ({
            referanse: "Mottatt_PersonInfo_" + mapRolle(rolle.rolleType),
            type: "PERSON_INFO",
            innhold: {
                fnr: rolle.ident,
                navn: rolleInfo.find((info) => info.ident == rolle.ident).navn,
                rolle: mapRolle(rolle.rolleType),
            },
        }));
}

export function mapBehandlingReferanseliste(
    behandlingId: number,
    behandling: BehandlingDto
): OpprettBehandlingsreferanseRequestDto[] {
    const behandlingReferanseListe: OpprettBehandlingsreferanseRequestDto[] = [
        {
            kilde: "BEHANDLING_ID",
            referanse: behandlingId.toString(),
        },
        {
            kilde: "BISYS_SOKNAD",
            referanse: behandling.soknadsid.toString(),
        },
    ];
    behandling.soknadRefId &&
        behandlingReferanseListe.push({
            kilde: "BISYS_KLAGE_REF_SOKNAD",
            referanse: behandling.soknadRefId.toString(),
        });
    return behandlingReferanseListe;
}
export function mapResultatKodeToDisplayValue(kode: string): string {
    switch (kode) {
        case "ORDINAERT_FORSKUDD_75_PROSENT":
            return "Forskudd";
        case "REDUSERT_FORSKUDD_50_PROSENT":
            return "Redusert forskudd";
        case "FORHOYET_FORSKUDD_100_PROSENT":
            return "Forhøyet forskudd";
        case "FORHOYET_FORSKUDD_11_AAR_125_PROSENT":
            return "Forhøyet forskudd ved 11 år";
        case "AVSLAG":
            return "Avslag";
    }
    return kode;
}
