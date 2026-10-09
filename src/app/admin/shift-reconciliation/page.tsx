'use client';

import React, { useState } from 'react';
import { usePOS } from '../../../context/POSContext';
import { Clock, Lock, Printer, CheckCircle2, Banknote, CreditCard, QrCode, ShieldAlert } from 'lucide-react';

export default function ShiftReconciliationPage() {
  const { activeShift, closeCurrentShift, showToast } = usePOS();
  const [physicalCash, setPhysicalCash] = useState<number>(activeShift.openingFloat + activeShift.cashSales);

  const expectedCashInDrawer = activeShift.openingFloat + activeShift.cashSales;
  const variance = physicalCash - expectedCashInDrawer;

  const handleCloseShift = () => {
    closeCurrentShift();
    window.print();
  };

  if (activeShift.status === 'CLOSED') {
    return (
      <div className="space-y-6 max-w-xl mx-auto mt-12">
        <div className="bg-theme-white p-8 rounded-2xl border border-theme-gray-border shadow-xs text-center space-y-6">
          <div className="w-16 h-16 bg-blue-50 text-theme-blue rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#1B2850]">Register is Closed</h2>
            <p className="text-theme-gray-text mt-2 text-sm font-mono">
              You must open a new shift and declare your starting float to begin billing.
            </p>
          </div>

          <div className="text-left font-mono max-w-sm mx-auto">
            <label className="block text-xs font-bold text-theme-navy mb-1.5">
              Opening Float Amount (₹)
            </label>
            <input
              type="number"
              value={physicalCash}
              onChange={(e) => setPhysicalCash(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-bold text-lg text-theme-navy bg-theme-white focus:border-theme-blue outline-none transition-colors"
              placeholder="e.g. 2000"
            />
          </div>

          <button
            onClick={() => usePOS().openShift(physicalCash)}
            className="w-full py-3.5 bg-theme-blue hover:bg-theme-blue text-white font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Clock className="w-5 h-5" />
            <span>Open New Shift</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between bg-theme-white p-5 rounded-2xl border border-theme-gray-border shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2850] tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-theme-blue" />
            Shift Reconciliation & Z-Report
          </h1>
          <p className="text-xs text-theme-gray-text font-mono mt-0.5">
            Drawer float audit, payment gateway split tally & end-of-day register closure
          </p>
        </div>

        <span className={`px-3 py-1 rounded-full font-mono text-xs font-bold ${
          activeShift.status === 'OPEN'
            ? 'bg-theme-teal/20 text-emerald-800'
            : 'bg-slate-200 text-theme-navy'
        }`}>
          SHIFT STATUS: {activeShift.status}
        </span>
      </div>

      {/* Audit Box Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
        {/* Left Column: Shift Sales Summary */}
        <div className="bg-theme-white p-6 rounded-2xl border border-theme-gray-border shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[#1B2850] uppercase border-b border-slate-100 pb-2">
            System Register Audit
          </h2>

          <div className="space-y-2.5 text-xs text-theme-navy">
            <div className="flex justify-between">
              <span>Cashier Name:</span>
              <span className="font-bold text-theme-navy">{activeShift.cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span>Counter Identifier:</span>
              <span className="font-bold text-theme-blue">{activeShift.counterId}</span>
            </div>
            <div className="flex justify-between">
              <span>Shift Start Time:</span>
              <span>{new Date(activeShift.shiftStart).toLocaleTimeString()}</span>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex justify-between">
                <span>Opening Cash Float:</span>
                <span className="font-bold">₹{activeShift.openingFloat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-theme-teal font-bold">
                <span className="flex items-center gap-1.5">
                  <Banknote className="w-4 h-4" /> Cash Sales:
                </span>
                <span>+₹{activeShift.cashSales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-indigo-700">
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" /> Card Sales:
                </span>
                <span>₹{activeShift.cardSales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-theme-blue">
                <span className="flex items-center gap-1.5">
                  <QrCode className="w-4 h-4" /> UPI Sales:
                </span>
                <span>₹{activeShift.upiSales.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-3 border-t-2 border-slate-900 flex justify-between items-baseline text-sm font-bold text-theme-navy">
              <span>TOTAL SHIFT SALES:</span>
              <span className="text-xl text-theme-teal">
                ₹{activeShift.totalSales.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Physical Cash Count & Reconciliation */}
        <div className="bg-theme-white p-6 rounded-2xl border border-theme-gray-border shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-[#1B2850] uppercase border-b border-slate-100 pb-2">
              Drawer Cash Reconciliation
            </h2>

            <div className="bg-theme-gray-light p-3 rounded-xl border border-theme-gray-border space-y-1 text-xs">
              <span className="text-theme-gray-text font-bold">EXPECTED CASH IN DRAWER:</span>
              <div className="text-2xl font-bold text-theme-navy">
                ₹{expectedCashInDrawer.toFixed(2)}
              </div>
              <p className="text-[10px] text-slate-400">Opening float (₹{activeShift.openingFloat}) + Tendered Cash (₹{activeShift.cashSales})</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-theme-navy mb-1">
                Enter Physical Cash Counted in Till (₹)
              </label>
              <input
                type="number"
                value={physicalCash}
                onChange={(e) => setPhysicalCash(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border-2 border-theme-blue rounded-xl font-bold text-xl text-theme-navy bg-theme-white"
              />
            </div>

            <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-bold ${
              variance === 0
                ? 'bg-emerald-50 border-theme-teal text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <span>DRAWER VARIANCE:</span>
              <span className="text-lg">
                {variance === 0 ? '₹0.00 Perfect Match' : `${variance > 0 ? '+' : ''}₹${variance.toFixed(2)}`}
              </span>
            </div>
          </div>

          <button
            onClick={handleCloseShift}
            disabled={activeShift.status === 'CLOSED'}
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <Lock className="w-4 h-4 text-theme-teal" />
            <span>CLOSE SHIFT & PRINT Z-REPORT</span>
          </button>
        </div>
      </div>
    </div>
  );
}
