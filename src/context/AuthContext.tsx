'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

type Role = 'SuperAdmin' | 'Admin' | 'SuperUser' | 'User';

export const Roles = {
  superAdmin: 'SuperAdmin',
  admin: 'Admin',
  superUser: 'SuperUser',
  user: 'User'
}

interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  organizationId: number;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => { },
  logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Auto-login using token from secure cookie
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_ROOT_URL}/authentication/user-auth`, {
          withCredentials: true,
        });
        console.log(res.data)
        setUser(res.data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_ROOT_URL}/authentication/admin-login`,
      { email, password },
      { withCredentials: true }
    );
    console.log(res.data)
    setUser(res.data.user);
    router.push('/home'); // redirect on successful login
  };

  const logout = async () => {
    await axios.post(
      `${process.env.NEXT_PUBLIC_ROOT_URL}/authentication/admin-logout`,
      {},
      { withCredentials: true }
    );
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
