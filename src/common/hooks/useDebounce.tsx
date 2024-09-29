/* eslint-disable @typescript-eslint/no-explicit-any */
import { useBehandlingProvider } from "@common/context/BehandlingContext";
import { debounce } from "lodash";
import { useEffect, useMemo, useRef } from "react";

export const useDebounce = (callback: (...args: any) => void) => {
    const ref = useRef<(...args: any) => void>();
    const { setDebouncing } = useBehandlingProvider();

    useEffect(() => {
        ref.current = callback;
    }, [callback]);

    const debouncedCallback = useMemo(() => {
        const func = (...args: any) => {
            ref.current?.(args);
            setDebouncing(false);
        };

        return debounce(func, 500);
    }, []);

    return (...args: any) => {
        setDebouncing(true);
        debouncedCallback(args);
    };
};
