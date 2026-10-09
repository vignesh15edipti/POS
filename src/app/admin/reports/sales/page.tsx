'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectToSales() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/sales');
  }, [router]);
  return null;
}
