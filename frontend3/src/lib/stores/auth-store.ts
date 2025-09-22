import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  initializeAuth: () => Promise<void>;
  clearError: () => void;
}

const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log("Auth Store: Authorization header set");
  } else {
    delete api.defaults.headers.common['Authorization'];
    console.log("Auth Store: Authorization header removed");
  }
};

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      initialized: false,

      initializeAuth: async () => {
        set({ loading: true, error: null });
        const token = localStorage.getItem('token');
        console.log("Initializing auth with token:", token ? "exists" : "none");

        if (token) {
          setAuthToken(token);
          try {
            const response = await api.get('/auth/me');
            set({
              user: response.data.user,
              token,
              isAuthenticated: true,
              initialized: true,
              loading: false,
              error: null
            });
            console.log("Auth initialized with user:", response.data.user);
          } catch (err: any) {
            console.error("Failed to fetch user data:", err);
            localStorage.removeItem('token');
            setAuthToken(null);
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              initialized: true,
              loading: false,
              error: err.response?.data?.message || err.message
            });
          }
        } else {
          set({
            initialized: true,
            loading: false
          });
        }
      },

      login: async (email: string, password: string) => {
        set({ loading: true, error: null });
        try {
          console.log("Attempting login for:", email);
          const response = await api.post('/auth/login', { email, password });
          const { token, user } = response.data;

          if (!token || !user) {
            throw new Error('Invalid response from server');
          }

          localStorage.setItem('token', token);
          setAuthToken(token);

          set({
            user,
            token,
            isAuthenticated: true,
            loading: false,
            error: null
          });

          console.log("Login successful for:", email);
        } catch (err: any) {
          console.error("Login error:", err);
          localStorage.removeItem('token');
          setAuthToken(null);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: err.response?.data?.message || err.message
          });
          throw err;
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ loading: true, error: null });
        try {
          console.log("Attempting registration for:", email);
          const response = await api.post('/auth/register', {
            name,
            email,
            password
          });
          
          console.log("Registration response:", response.data);
          const { token, user } = response.data;

          if (!token || !user) {
            console.error("Missing token or user in response:", { token: !!token, user: !!user });
            throw new Error('Invalid response from server');
          }

          localStorage.setItem('token', token);
          setAuthToken(token);

          set({
            user,
            token,
            isAuthenticated: true,
            loading: false,
            error: null
          });
        } catch (err: any) {
          console.error("Registration error:", err);
          set({
            loading: false,
            error: err.response?.data?.message || err.message
          });
          throw err;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        setAuthToken(null);
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
          loading: false
        });
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user
      })
    }
  )
);

export default useAuthStore;