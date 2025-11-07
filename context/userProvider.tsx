'use client';

import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';
import { getCurrentUser } from '@/app/actions/userActions';
import { usePathname } from 'next/navigation';

type User = {
    id: number;
    name: string;
    email: string;
    role: 'student' | 'admin';
    department_id?: number;
} | null;

type UserContextType = {
    user: User;
    setUser: Dispatch<SetStateAction<User>>;
    loading: boolean;
};

const UserContext = createContext<UserContextType>({
    user: null,
    setUser: () => { },
    loading: true,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User>(null);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();

    useEffect(() => {
        if (user) return;
        async function loadUser() {
            const data = await getCurrentUser();
            setUser(data);
            setLoading(false);
        }
        loadUser();
    }, [pathname]);

    return (
        <UserContext.Provider value={{ user, loading, setUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}
