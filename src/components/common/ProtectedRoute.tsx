'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { usePOS } from '../../context/POSContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('OWNER' | 'ADMIN' | 'CASHIER')[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { activeUser } = usePOS();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for the context to initialize from localStorage (could be a split second)
    const timer = setTimeout(() => {
      setIsChecking(false);
      
      if (!activeUser) {
        router.push('/login');
        return;
      }

      if (allowedRoles && !allowedRoles.includes(activeUser.role as any)) {
        // Redirect unauthorized
        if (activeUser.role === 'CASHIER') {
          router.push('/pos');
        } else {
          router.push('/admin/dashboard');
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [activeUser, allowedRoles, router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-8 h-8 border-4 border-theme-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!activeUser) return null;
  
  if (allowedRoles && !allowedRoles.includes(activeUser.role as any)) {
    return null;
  }

  return <>{children}</>;
}
