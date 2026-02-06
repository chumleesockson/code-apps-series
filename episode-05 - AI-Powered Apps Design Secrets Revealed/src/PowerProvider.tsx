import { initialize, getContext } from "@microsoft/power-apps/app";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface UserContext {
    fullName: string;
    objectId: string;
    tenantId: string;
    userPrincipalName: string;
}

interface PowerContextValue {
    user: UserContext | null;
    isLoading: boolean;
}

const PowerContext = createContext<PowerContextValue>({ user: null, isLoading: true });

export function usePowerContext() {
    return useContext(PowerContext);
}

interface PowerProviderProps {
    children: ReactNode;
}

export default function PowerProvider({ children }: PowerProviderProps) {
    const [user, setUser] = useState<UserContext | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function initializeAndGetContext() {
            await initialize();
            try {
                const ctx = await getContext();
                setUser({
                    fullName: ctx.user.fullName,
                    objectId: ctx.user.objectId,
                    tenantId: ctx.user.tenantId,
                    userPrincipalName: ctx.user.userPrincipalName,
                });
            } catch (error) {
                console.error("Failed to get context:", error);
            } finally {
                setIsLoading(false);
            }
        }
        initializeAndGetContext();
    }, []);

    return (
        <PowerContext.Provider value={{ user, isLoading }}>
            {children}
        </PowerContext.Provider>
    );
}