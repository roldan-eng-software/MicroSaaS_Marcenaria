import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const useAuthStore = create((set) => ({
    user: null,
    loading: true,
    error: null,

    // Action to initialize the session
    init: () => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            set({ user: session?.user ?? null, loading: false });
        }).catch(error => {
            console.error('Error in init getSession:', error);
            set({ error, loading: false });
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            set({ user: session?.user ?? null });
        });

        return () => subscription.unsubscribe();
    },

    // Auth actions
    signIn: async ({ email, password }) => {
        set({ loading: true, error: null });
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            set({ error, loading: false });
        }
        return { data, error };
    },

    signUp: async ({ email, password }) => {
        set({ loading: true, error: null });
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
            set({ error, loading: false });
        }
        return { data, error };
    },

    signOut: async () => {
        set({ loading: true, error: null });
        await supabase.auth.signOut();
        set({ user: null, loading: false });
    },
}));

export default useAuthStore;
