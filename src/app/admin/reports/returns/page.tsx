'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectToReturns() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/sales-return');
  }, [router]);
  return null;
}
