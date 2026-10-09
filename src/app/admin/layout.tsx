'use client';

import React from 'react';
import { Header } from '../../components/common/Header';
import { Sidebar } from '../../components/common/Sidebar';
import { Toast } from '../../components/common/Toast';
import { ThermalReceiptModal } from '../../components/pos/ThermalReceiptModal';
import { POSProvider } from '../../context/POSContext';
import { ProtectedRoute } from '../../components/common/ProtectedRoute';

import pageBg from '@/asset/images/pagebg.jpg';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <POSProvider>
      <ProtectedRoute allowedRoles={['OWNER', 'ADMIN']}>
        <div className="min-h-screen bg-[#F8FAFC] relative">
          <div 
            className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]"
            style={{ 
              backgroundImage: `url(${pageBg.src})`, 
              backgroundSize: 'cover', 
              backgroundPosition: 'center', 
              backgroundRepeat: 'no-repeat'
            }}
          />
          <div className="relative z-10 flex flex-col min-h-screen">
            <Header />
            <Sidebar />
            <main className="pl-64 pt-20 flex-1">
              <div className="px-4 md:px-8">
                {children}
              </div>
            </main>
            <ThermalReceiptModal />
            <Toast />
          </div>
        </div>
      </ProtectedRoute>
    </POSProvider>
  );
}
