'use client';

import React, { useEffect, useState } from 'react';
import { Search, FileText, Download, Printer } from 'lucide-react';
import { usePOS } from '../../../context/POSContext';

interface Bill {
  _id: string;
  invoiceNumber: string;
  subtotal: number;
  tax: number;
  discount: number;
  grandTotal: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  customerName?: string;
  customerMobile?: string;
}

export default function InvoicesPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const { showToast } = usePOS();

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const res = await fetch('/api/sales?limit=100');
      const data = await res.json();
      if (data.success) {
        setBills(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBills = bills.filter(bill => 
    bill.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    (bill.customerName && bill.customerName.toLowerCase().includes(search.toLowerCase())) ||
    (bill.customerMobile && bill.customerMobile.includes(search))
  );

  const handlePrint = (billId: string) => {
    window.open(`/api/sales/${billId}/print`, '_blank', 'width=400,height=600');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2850]">Invoices</h1>
          <p className="text-xs text-slate-500 mt-1">View, print, and download customer invoices</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-140px)]">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search by Invoice ID, Customer Name, or Mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-theme-blue/20 outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="text-center py-10 text-slate-400">Loading invoices...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 sticky top-0 text-slate-500 font-mono text-[10px] uppercase shadow-sm">
                <tr>
                  <th className="p-4 font-bold">Invoice No</th>
                  <th className="p-4 font-bold">Date & Time</th>
                  <th className="p-4 font-bold">Customer</th>
                  <th className="p-4 font-bold">Amount</th>
                  <th className="p-4 font-bold text-center">Status</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBills.map(bill => (
                  <tr key={bill._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono font-bold text-theme-navy">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-theme-blue" />
                        {bill.invoiceNumber}
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">
                      {new Date(bill.createdAt).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="p-4">
                      {bill.customerName ? (
                        <>
                          <div className="font-bold text-slate-800">{bill.customerName}</div>
                          <div className="text-xs text-slate-500">{bill.customerMobile}</div>
                        </>
                      ) : (
                        <span className="text-slate-400">Walk-in</span>
                      )}
                    </td>
                    <td className="p-4 font-bold text-theme-teal">₹{bill.grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        bill.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                        bill.status === 'REFUNDED' ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                        'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {bill.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handlePrint(bill._id)}
                        className="p-2 text-slate-400 hover:text-theme-blue hover:bg-theme-blue/10 rounded-lg transition-colors"
                        title="Print Invoice"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredBills.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                      No invoices found.
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
