import { IRollerUi } from "../types/bidrag-sak"
import { RolleTag } from "./RolleTag";
import React from "react";

export const RolleDetaljer = ({rolle}: {rolle: IRollerUi}) => {
  return <div
      className="px-6 py-2 border-[var(--a-border-divider)] border-solid border-b flex">
        <RolleTag rolleType={rolle.type} />
        <span className="w-64">{rolle.fulltNavn}</span>
        <span className="mx-4">/</span> {rolle.fodselsnummer}
  </div>
}