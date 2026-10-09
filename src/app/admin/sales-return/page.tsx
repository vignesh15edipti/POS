'use client';

import React, { useEffect, useState } from 'react';
import { Search, RotateCcw, AlertTriangle } from 'lucide-react';

interface ReturnItem {
  productId: string;
  productName: string;
  sku: string;
  returnQuantity: number;
  refundAmount: number;
  reason: string;
}

interface SalesReturn {
  _id: string;
  returnId: string;
  saleId: string;
  invoiceNumber: string;
  returnedItems: ReturnItem[];
  totalRefundAmount: number;
  status: string;
  createdAt: string;
}

export default function SalesReturnPage() {
  const [returns, setReturns] = useState<SalesReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      const res = await fetch('/api/sales/returns?limit=100');
      const data = await res.json();
      if (data.success) {
        setReturns(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch returns:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReturns = returns.filter(r => 
    r.returnId.toLowerCase().includes(search.toLowerCase()) ||
    r.invoiceNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2850]">Sales Returns</h1>
          <p className="text-xs text-slate-500 mt-1">History of returned items and refunds processed</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-140px)]">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search by Return ID or Original Invoice..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-theme-blue/20 outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="text-center py-10 text-slate-400">Loading returns...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 sticky top-0 text-slate-500 font-mono text-[10px] uppercase shadow-sm">
                <tr>
                  <th className="p-4 font-bold">Return ID</th>
                  <th className="p-4 font-bold">Original Invoice</th>
                  <th className="p-4 font-bold">Date</th>
                  <th className="p-4 font-bold">Items Returned</th>
                  <th className="p-4 font-bold">Refund Amount</th>
                  <th className="p-4 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReturns.map(ret => (
                  <tr key={ret._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono font-bold text-rose-600">
                      <div className="flex items-center gap-2">
                        <RotateCcw className="w-4 h-4" />
                        {ret.returnId}
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-600">
                      {ret.invoiceNumber}
                    </td>
                    <td className="p-4 text-slate-600">
                      {new Date(ret.createdAt).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="p-4">
                      <div className="text-xs text-slate-600 space-y-1 max-w-[250px]">
                        {ret.returnedItems.map((item, idx) => (
                          <div key={idx} className="truncate">
                            <span className="font-bold text-theme-navy">{item.returnQuantity}x</span> {item.productName}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-theme-teal">₹{ret.totalRefundAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        ret.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {ret.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredReturns.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                      <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      No sales returns found.
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
