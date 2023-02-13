import { PropsWithChildren } from "react";

export const InlineGrid = ({ children }: PropsWithChildren) => (
    <div className="grid grid-flow-col gap-x-4 auto-cols-max">{children}</div>
);
