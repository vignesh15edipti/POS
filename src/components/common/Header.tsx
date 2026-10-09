'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePOS } from '../../context/POSContext';
import { Store, CreditCard, ShoppingCart, Lock, Bell, User, Zap, Search, Maximize } from 'lucide-react';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { activeUser, activeShift, cart, logoutUser } = usePOS();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-theme-white shadow-sm border-b border-theme-gray-border z-50 flex items-center justify-between px-6">
      {/* Brand & Branch Info */}
      <div className="flex items-center gap-6">
        <Link href="/admin/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-theme-blue flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:bg-theme-blue transition-colors">
            <Store className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl text-[#1B2850] tracking-tight flex items-center gap-1.5">
              TN FRESHKART <span className="text-theme-teal">GREEN</span>
              
            </span>
            <span className="text-xs text-theme-gray-text font-medium">Smart Grocery POS</span>
          </div>
        </Link>

      </div>

      {/* Center Keyboard Accelerators & POS Link */}
      <div className="flex items-center gap-3">
        {/* Animated Search Bar */}
        <div className="relative hidden md:block group">
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="w-48 focus:w-64 transition-all duration-300 bg-slate-50 border border-slate-200 focus:border-theme-blue focus:ring-2 focus:ring-theme-blue/20 rounded-full pl-10 pr-4 py-1.5 text-sm outline-none shadow-sm"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-theme-blue transition-colors" />
        </div>

        {/* Action Icons */}
        <button onClick={toggleFullScreen} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
          <Maximize className="w-4 h-4" />
        </button>
        <div className="relative">
          <button onClick={() => setShowNotifications(!showNotifications)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white animate-pulse"></span>
          </button>
          
          {showNotifications && (
            <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 p-4 z-50">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <h4 className="text-sm font-bold text-slate-800">Notifications</h4>
                <span className="text-[10px] bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-bold">1 New</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-2 bg-slate-50 rounded-lg">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-rose-500 shrink-0"></div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Low Stock Alert</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Organic Tomatoes are running low (2 kg remaining).</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <Link
          href="/pos"
          className="flex items-center gap-2 px-4 py-2 bg-theme-teal hover:bg-theme-teal text-white font-semibold rounded-xl text-sm transition-all shadow-sm active:scale-95"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Launch Cashier POS</span>
          {cartCount > 0 && (
            <span className="ml-1 bg-theme-white text-theme-teal text-xs font-bold font-mono px-2 py-0.5 rounded-full shadow-xs">
              {cartCount}
            </span>
          )}
        </Link>
      </div>

      {/* User Info & Profile */}
      <div className="flex items-center gap-4">
        {activeUser && (
          <>
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-[#1B2850] leading-tight">Vignesh</div>
              <div className="text-xs font-mono text-[#0E9384] font-medium leading-tight flex items-center justify-end gap-1">
                <Zap className="w-3 h-3" /> {activeUser.role} ({activeShift.counterId})
              </div>
            </div>

            <div className="relative group cursor-pointer">
              <img 
                src="https://ui-avatars.com/api/?name=Vignesh&background=0E9384&color=fff&size=128" 
                alt="Vignesh" 
                className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/30"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-theme-teal ring-2 ring-white"></span>
            </div>

            <button 
              onClick={() => { logoutUser(); window.location.href = '/login'; }}
              className="p-2 ml-2 text-theme-gray-text hover:text-rose-500 bg-slate-100 hover:bg-rose-50 rounded-xl transition-colors"
              title="Logout"
            >
              <Lock className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </header>
  );
};
