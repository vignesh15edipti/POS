'use client';

import React, { useEffect, useState } from 'react';
import { Search, ShoppingBag, Eye, X } from 'lucide-react';

interface Purchase {
  _id: string;
  purchaseNumber: string;
  invoiceNumber: string;
  supplierId: { name: string; mobile: string };
  purchaseDate: string;
  items: any[];
  grandTotal: number;
  paymentStatus: string;
  amountPaid: number;
  amountDue: number;
  status: string;
}

export default function PurchasesHistoryPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const res = await fetch('/api/purchases?limit=100');
      const data = await res.json();
      if (data.success) {
        setPurchases(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPurchases = purchases.filter(p => 
    p.purchaseNumber.toLowerCase().includes(search.toLowerCase()) ||
    p.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    (p.supplierId && p.supplierId.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2850]">Purchase History</h1>
          <p className="text-xs text-slate-500 mt-1">View all past purchase orders and supplier invoices</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-140px)]">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search by PO Number, Invoice or Supplier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-theme-blue/20 outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="text-center py-10 text-slate-400">Loading purchases...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 sticky top-0 text-slate-500 font-mono text-[10px] uppercase shadow-sm z-10">
                <tr>
                  <th className="p-4 font-bold">PO Number</th>
                  <th className="p-4 font-bold">Date</th>
                  <th className="p-4 font-bold">Supplier</th>
                  <th className="p-4 font-bold">Total Amount</th>
                  <th className="p-4 font-bold text-center">Payment Status</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPurchases.map(purchase => (
                  <tr key={purchase._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono font-bold text-theme-navy">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-theme-orange" />
                        {purchase.purchaseNumber}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Inv: {purchase.invoiceNumber}</div>
                    </td>
                    <td className="p-4 text-slate-600">
                      {new Date(purchase.purchaseDate).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="p-4">
                      {purchase.supplierId ? (
                        <div className="font-bold text-slate-800">{purchase.supplierId.name}</div>
                      ) : (
                        <span className="text-slate-400 italic">Unknown</span>
                      )}
                    </td>
                    <td className="p-4 font-bold text-theme-teal">
                      ₹{purchase.grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        purchase.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                        purchase.paymentStatus === 'PARTIAL' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                        'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {purchase.paymentStatus}
                      </span>
                      {purchase.paymentStatus !== 'PAID' && (
                        <div className="text-[9px] text-rose-500 mt-1 font-mono">Due: ₹{purchase.amountDue}</div>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedPurchase(purchase)}
                        className="px-3 py-1.5 text-theme-blue bg-theme-blue/10 hover:bg-theme-blue/20 font-bold rounded-lg transition-colors flex items-center justify-end gap-1.5 ml-auto text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredPurchases.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                      No purchases found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* View Details Modal */}
      {selectedPurchase && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-[500px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-lg font-bold text-slate-800">{selectedPurchase.purchaseNumber}</h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">Inv: {selectedPurchase.invoiceNumber}</p>
              </div>
              <button onClick={() => setSelectedPurchase(null)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Items Purchased</h4>
                <div className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-100/50 border-b border-slate-100">
                      <tr>
                        <th className="p-2 text-left font-bold text-slate-600">Item</th>
                        <th className="p-2 text-right font-bold text-slate-600">Qty</th>
                        <th className="p-2 text-right font-bold text-slate-600">Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedPurchase.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2">
                            <p className="font-bold text-theme-navy">{item.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{item.sku}</p>
                          </td>
                          <td className="p-2 text-right font-bold">{item.quantity} {item.unit}</td>
                          <td className="p-2 text-right">₹{(item.total).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
