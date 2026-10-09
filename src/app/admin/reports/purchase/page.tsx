'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectToPurchases() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/purchases');
  }, [router]);
  return null;
}
