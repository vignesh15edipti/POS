'use client';

import React, { useEffect, useState } from 'react';
import { CreditCard, Wallet, Banknote, Search } from 'lucide-react';

interface Payment {
  _id: string;
  invoiceNumber: string;
  grandTotal: number;
  paymentMethod: string;
  createdAt: string;
  customerName?: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/sales?limit=100');
      const data = await res.json();
      if (data.success) {
        // Filter out cancelled/returned sales for accurate payment ledger
        const validPayments = data.data.filter((s: any) => s.status === 'COMPLETED');
        setPayments(validPayments);
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(p => 
    p.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    (p.customerName && p.customerName.toLowerCase().includes(search.toLowerCase())) ||
    p.paymentMethod.toLowerCase().includes(search.toLowerCase())
  );

  const getMethodIcon = (method: string) => {
    switch (method.toUpperCase()) {
      case 'CASH': return <Banknote className="w-4 h-4" />;
      case 'CARD': return <CreditCard className="w-4 h-4" />;
      case 'UPI': return <Wallet className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };

  const totalCollected = filteredPayments.reduce((sum, p) => sum + p.grandTotal, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2850]">Payment Ledger</h1>
          <p className="text-xs text-slate-500 mt-1">Track all incoming payments from POS sales</p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-200">
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Filtered Total</p>
          <p className="text-lg font-bold">₹{totalCollected.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-140px)]">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search by Invoice, Customer, or Payment Method..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-theme-blue/20 outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="text-center py-10 text-slate-400">Loading payments...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 sticky top-0 text-slate-500 font-mono text-[10px] uppercase shadow-sm">
                <tr>
                  <th className="p-4 font-bold">Transaction Date</th>
                  <th className="p-4 font-bold">Source Invoice</th>
                  <th className="p-4 font-bold">Customer</th>
                  <th className="p-4 font-bold">Payment Method</th>
                  <th className="p-4 font-bold">Amount Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map(payment => (
                  <tr key={payment._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-slate-600">
                      {new Date(payment.createdAt).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="p-4 font-mono font-bold text-theme-navy">
                      {payment.invoiceNumber}
                    </td>
                    <td className="p-4">
                      {payment.customerName ? (
                        <span className="font-bold text-slate-800">{payment.customerName}</span>
                      ) : (
                        <span className="text-slate-400 italic">Walk-in Customer</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700">
                        {getMethodIcon(payment.paymentMethod)}
                        {payment.paymentMethod.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-emerald-600 text-base">
                      + ₹{payment.grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                {filteredPayments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">
                      No payment records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
