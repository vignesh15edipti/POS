'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectToExpenses() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/expenses');
  }, [router]);
  return null;
}
