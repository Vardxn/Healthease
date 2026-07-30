'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('patient' | 'doctor' | 'admin')[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in
        router.push(`/login?redirect=${pathname}`);
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Logged in, but wrong role
        if (user.role === 'admin') router.push('/admin');
        else if (user.role === 'doctor') router.push('/doctor');
        else router.push('/dashboard');
      } else {
        // Authorized
        setIsAuthorized(true);
      }
    }
  }, [user, loading, router, pathname, allowedRoles]);

  if (loading || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#0D9488]" />
          <p className="text-slate-500 font-medium animate-pulse">Verifying access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
