/* eslint-disable @typescript-eslint/no-explicit-any */
import { debounce } from "lodash";
import { useEffect, useMemo, useRef } from "react";

export const useDebounce = (callback: (...args: any) => void) => {
    const ref = useRef<(...args: any) => void>();

    useEffect(() => {
        ref.current = callback;
    }, [callback]);

    const debouncedCallback = useMemo(() => {
        const func = (...args: any) => {
            ref.current?.(args);
        };

        return debounce(func, 500);
    }, []);

    return debouncedCallback;
};
