import { PropsWithChildren } from "react";

export const FlexRow = ({ children }: PropsWithChildren) => (
    <div className="flex flex-wrap flex-row gap-4">{children}</div>
);
