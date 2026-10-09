'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Store, ShieldCheck, Delete } from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import loginBg from '@/asset/images/background2.jpg';
import bagImg from '@/asset/images/bag.png';

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { activeUser, loginUser } = usePOS();

  // If already logged in, redirect
  useEffect(() => {
    if (activeUser) {
      if (activeUser.role === 'OWNER' || activeUser.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/pos');
      }
    }
  }, [activeUser, router]);

  const handleNumber = (num: string) => {
    setError('');
    if (pin.length < 4) {
      setPin(prev => prev + num);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });
      const data = await res.json();
      
      if (data.success) {
        loginUser({
          id: data.data.id,
          name: data.data.name,
          email: `${data.data.employeeId}@freshkart.com`,
          role: data.data.role,
          counterId: 'COUNTER-01',
          isActive: true
        });
      } else {
        setError(data.error || 'Invalid PIN');
        setPin('');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  // Auto-submit when 4 digits are entered
  useEffect(() => {
    if (pin.length === 4) {
      handleSubmit();
    }
  }, [pin]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-[#F0F2F5]">
      {/* Full Screen Background Image */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ 
          backgroundImage: `url(${loginBg.src})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          filter: 'brightness(1.05)'
        }}
      />
      
      {/* Outer Glassmorphism Container */}
      <div className="w-full max-w-5xl bg-white/20 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] p-3 sm:p-4 flex flex-col md:flex-row-reverse items-stretch gap-6 relative z-10 min-h-[600px]">
        
        {/* Login Card (Now on the Right) */}
        <div className="bg-[#FAF9F6] rounded-[2rem] p-8 w-full md:w-[420px] shadow-lg flex flex-col justify-center shrink-0">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-slate-800 font-bold mb-4">
              <Store className="w-5 h-5 text-[#E04F26]" />
              <span className="text-sm">TN FRESHKART GREEN</span>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight mb-2">Login</h1>
            <p className="text-slate-500 text-xs font-medium">Enter your 4-digit secure PIN to continue</p>
          </div>

          {/* PIN Dots Indicator */}
          <div className="flex justify-start gap-3 mb-4">
            {[...Array(4)].map((_, i) => (
              <div 
                key={i}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                  i < pin.length 
                    ? 'bg-[#E04F26] scale-110 shadow-[0_0_10px_rgba(224,79,38,0.4)]' 
                    : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          <div className="h-4 mb-2 text-rose-500 text-xs font-bold">
            {error}
          </div>

          {/* PIN Pad */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumber(num.toString())}
                disabled={loading}
                className="h-12 rounded-xl bg-white shadow-sm border border-slate-100 hover:bg-[#E04F26] hover:text-white hover:border-[#E04F26] active:scale-95 transition-all text-lg font-bold text-slate-700 disabled:opacity-50"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleClear}
              disabled={loading}
              className="h-12 rounded-xl bg-slate-100 hover:bg-rose-100 active:scale-95 transition-all text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-rose-600 disabled:opacity-50"
            >
              Clear
            </button>
            <button
              onClick={() => handleNumber('0')}
              disabled={loading}
              className="h-12 rounded-xl bg-white shadow-sm border border-slate-100 hover:bg-[#E04F26] hover:text-white hover:border-[#E04F26] active:scale-95 transition-all text-lg font-bold text-slate-700 disabled:opacity-50"
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              disabled={loading}
              className="h-12 rounded-xl bg-slate-100 hover:bg-amber-100 active:scale-95 transition-all flex items-center justify-center text-slate-500 hover:text-amber-600 disabled:opacity-50"
            >
              <Delete className="w-4 h-4" />
            </button>
          </div>

          {/* Sign In Button */}
          <button 
            onClick={() => handleSubmit()}
            disabled={loading || pin.length !== 4}
            className="w-full py-3.5 rounded-xl bg-[#E04F26] text-white font-bold text-sm hover:bg-[#c94520] transition-colors shadow-md shadow-[#E04F26]/30 disabled:opacity-60 flex items-center justify-center gap-2 mb-6"
          >
            {loading ? (
              <><ShieldCheck className="w-4 h-4 animate-pulse" /> Authenticating...</>
            ) : (
              'Sign In'
            )}
          </button>

          {/* Or Continue With */}
          

        </div>

        {/* Right Side: Graphic/Illustration Area */}
        <div className="hidden md:flex flex-1 items-center justify-center p-8 relative">
           <style>{`
            @keyframes float {
              0% { transform: translateY(0px); }
              50% { transform: translateY(-20px); }
              100% { transform: translateY(0px); }
            }
            .animate-float {
              animation: float 6s ease-in-out infinite;
            }
          `}</style>
          <div className="relative animate-float flex flex-col items-center">
            <img 
              src={bagImg.src} 
              alt="Fresh Grocery Bag" 
              className="w-[28rem] h-auto drop-shadow-2xl opacity-95"
            />
            <div className="mt-8 text-center space-y-2">
              <h2 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-lg">
                Fresh, Fast, Green.
              </h2>
              <p className="text-slate-100 font-medium drop-shadow-md max-w-sm mx-auto">
                Powering your daily grocery operations with intelligent retail solutions.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
