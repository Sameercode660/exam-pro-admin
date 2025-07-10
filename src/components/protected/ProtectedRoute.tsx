'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import QuoteLoader from '../utils/QuoteLoader';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading]);

  if (loading || !user) return <QuoteLoader></QuoteLoader>;

  return <>{children}</>;
};

export default ProtectedRoute;
