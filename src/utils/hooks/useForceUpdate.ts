import {useCallback, useState} from "react";

export default function useForceUpdate(): VoidFunction {
    const [, setValue] = useState<Record<string, never>>({});

    return useCallback((): void => setValue({}), []);
}
