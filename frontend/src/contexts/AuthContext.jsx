import { createContext, useContext, useEffect } from 'react';
import useAuthStore from '../stores/authStore';

// The context is now simpler, it will just provide a way to access the zustand store
const AuthContext = createContext({});

// The custom hook will now be a selector for the zustand store
export const useAuth = () => useAuthStore(state => state);

export const AuthProvider = ({ children }) => {
    const init = useAuthStore(state => state.init);
    const loading = useAuthStore(state => state.loading);

    // Initialize the auth state on component mount
    useEffect(() => {
        const unsubscribe = init();
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [init]);

    // The value provided by the context is now the entire store's state and actions
    // but we can just use the useAuth hook directly in components.
    // We'll keep the provider mainly for the loading gate.
    return (
        <AuthContext.Provider value={{}}>
            {!loading && children}
        </AuthContext.Provider>
    );
};