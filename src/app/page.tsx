'use client';

import React from 'react';
import Link from 'next/link';
import { Store, ShoppingBag, LayoutDashboard, Zap, ShieldCheck, Barcode, ChevronRight } from 'lucide-react';
import pageBg from '@/asset/images/background4.jpg';

export default function HomePortalPage() {
  return (
    <div className="relative min-h-screen bg-[#0F172A] text-slate-100 flex flex-col justify-between p-6 overflow-hidden">
      <style>{`
        @keyframes bgPanZoom {
          0% { transform: scale(1.05) translate(0, 0); }
          50% { transform: scale(1.1) translate(-1%, 1%); }
          100% { transform: scale(1.05) translate(0, 0); }
        }
        .animate-bg {
          animation: bgPanZoom 25s ease-in-out infinite;
        }
      `}</style>

      {/* Animated Background */}
      <div 
        className="absolute inset-0 z-0 animate-bg opacity-30 pointer-events-none"
        style={{ 
          backgroundImage: `url(${pageBg.src})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center'
        }}
      />
      
      {/* Dark gradient overlay for text readability */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0F172A]/90 via-[#0F172A]/50 to-[#0F172A] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between max-w-6xl mx-auto w-full pt-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-theme-teal flex items-center justify-center font-bold text-xl text-white shadow-lg">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-white flex items-center gap-2">
              TN FRESHKART <span className="text-theme-teal">GREEN</span>
              <span className="bg-theme-teal/20 text-theme-teal text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-theme-teal/30">
                GROCERY POS
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">Project ID: 272324084962522452</p>
          </div>
        </div>
      </header>

      {/* Main Portal Section */}
      <main className="relative z-10 max-w-4xl mx-auto w-full my-auto py-12 space-y-8 text-center">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-theme-teal/10 text-theme-teal rounded-full font-mono text-xs font-bold border border-theme-teal/20">
            <Zap className="w-4 h-4" /> Smart Grocery POS System
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            TN FRESHKART GREEN POS
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Complete with barcode scanning, instant thermal receipts, multi-mode payments & GST reports.
          </p>
        </div>

        {/* Action Choice Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {/* Card 1: Cashier POS */}
          <Link
            href="/pos"
            className="group bg-slate-800/60 hover:bg-slate-800 p-6 rounded-3xl border border-slate-700/80 hover:border-theme-teal/60 shadow-xl transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-theme-teal/20 text-theme-teal border border-theme-teal/30 flex items-center justify-center font-bold">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-theme-teal transition-colors flex items-center justify-between">
                <span>Cashier POS Checkout</span>
                <ChevronRight className="w-5 h-5 text-theme-gray-text group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Rapid D-Mart style checkout terminal with keyboard accelerators (F2, F4, F8), omni-barcode search, held bills queue & 80mm thermal receipt generator.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs font-mono text-theme-teal font-bold">
              <span>LAUNCH TERMINAL #01</span>
              <span className="bg-theme-teal/20 px-2 py-0.5 rounded">F2 SCAN BARCODE</span>
            </div>
          </Link>

          {/* Card 2: Executive Admin Dashboard */}
          <Link
            href="/admin/dashboard"
            className="group bg-slate-800/60 hover:bg-slate-800 p-6 rounded-3xl border border-slate-700/80 hover:border-emerald-500/60 shadow-xl transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                <span>Executive Admin Console</span>
                <ChevronRight className="w-5 h-5 text-theme-gray-text group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Real-time sales analytics, inventory catalog management, GST HSN reports, customer credit ledgers & shift reconciliation (Z-Report).
              </p>
            </div>

            <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs font-mono text-emerald-400 font-bold">
              <span>ENTER STORE SYSTEM</span>
              <span className="bg-emerald-500/20 px-2 py-0.5 rounded">FULL DASHBOARD</span>
            </div>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center text-xs font-mono text-theme-gray-text py-4 border-t border-slate-800/80">
        TN FRESHKART GREEN • build with edipti.in
      </footer>
    </div>
  );
}
