'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectToStock() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/stock');
  }, [router]);
  return null;
}
