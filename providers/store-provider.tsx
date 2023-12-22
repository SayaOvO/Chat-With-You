"use client";

import { store } from "@/store";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";

export function StoreProvider({
    children
}: { children: React.ReactNode}) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true)
    }, [])
    if (!isMounted) {
        return null;
    }
    return (
        <Provider store={store}>
            {children}
        </Provider>
    )
}