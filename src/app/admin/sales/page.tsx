'use client';

import React, { useEffect, useState } from 'react';
import { FileBarChart, Search, ChevronRight, X, ArrowDownLeft, Store } from 'lucide-react';
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
  items?: any[];
}

export default function SalesHistoryPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [returnItems, setReturnItems] = useState<{ productId: string; quantity: number }[]>([]);
  const [returnReason, setReturnReason] = useState('Customer Request');
  const [isProcessingReturn, setIsProcessingReturn] = useState(false);

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

  const handleOpenDetails = async (billId: string) => {
    try {
      const res = await fetch(`/api/sales/${billId}`);
      const data = await res.json();
      if (data.success) {
        setSelectedBill(data.data);
        setReturnItems([]);
        setIsModalOpen(true);
      }
    } catch (e) {
      showToast('❌ Failed to fetch bill details');
    }
  };

  const handleReturnItemToggle = (productId: string, maxQty: number, checked: boolean) => {
    if (checked) {
      setReturnItems(prev => [...prev, { productId, quantity: maxQty }]);
    } else {
      setReturnItems(prev => prev.filter(i => i.productId !== productId));
    }
  };

  const handleReturnQtyChange = (productId: string, qty: number, maxQty: number) => {
    if (qty > maxQty) qty = maxQty;
    if (qty < 0.001) qty = 0.001;
    setReturnItems(prev => prev.map(i => i.productId === productId ? { ...i, quantity: qty } : i));
  };

  const handleProcessReturn = async () => {
    if (!selectedBill || returnItems.length === 0) return;
    setIsProcessingReturn(true);
    try {
      const res = await fetch('/api/sales/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          saleId: selectedBill._id,
          returnedItems: returnItems,
          reason: returnReason
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('✓ Return processed successfully');
        setIsModalOpen(false);
        fetchBills(); // Refresh list
      } else {
        showToast(`❌ Error: ${data.error}`);
      }
    } catch (error: any) {
      showToast(`❌ Error processing return`);
    } finally {
      setIsProcessingReturn(false);
    }
  };

  const handlePrint = (id: string) => {
    window.open(`/invoice/${id}`, '_blank');
  };

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-theme-white p-5 rounded-2xl border border-theme-gray-border shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2850] tracking-tight flex items-center gap-2">
            <FileBarChart className="w-6 h-6 text-theme-blue" />
            Sales History & Returns
          </h1>
          <p className="text-xs text-theme-gray-text font-mono mt-0.5">
            View completed bills, print invoices, and process refunds/returns
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-theme-white p-4 rounded-2xl border border-theme-gray-border shadow-xs flex items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Invoice # or Customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-theme-gray-light border border-theme-gray-border rounded-xl text-xs font-mono"
          />
        </div>
      </div>

      {/* Sales History Table */}
      <div className="bg-theme-white rounded-2xl border border-theme-gray-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-theme-gray-light text-theme-gray-text text-[10px] uppercase border-b border-theme-gray-border">
                <th className="p-3">Invoice #</th>
                <th className="p-3">Date & Time</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Payment</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Grand Total</th>
                <th className="p-3 text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">Loading sales history...</td>
                </tr>
              ) : filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">No sales records found.</td>
                </tr>
              ) : (
                filteredBills.map((bill) => (
                  <tr key={bill._id} className="hover:bg-theme-gray-light cursor-pointer" onClick={() => handleOpenDetails(bill._id)}>
                    <td className="p-3">
                      <div className="font-bold text-theme-blue">{bill.invoiceNumber}</div>
                    </td>
                    <td className="p-3 text-theme-gray-text">
                      <div>{new Date(bill.createdAt).toLocaleDateString()}</div>
                      <div className="text-[10px]">{new Date(bill.createdAt).toLocaleTimeString()}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-theme-navy">{bill.customerName || 'Walk-in'}</div>
                      {bill.customerMobile && <div className="text-[10px] text-slate-400">{bill.customerMobile}</div>}
                    </td>
                    <td className="p-3">
                      <span className="bg-theme-gray-light text-theme-navy px-2 py-0.5 rounded text-[10px] font-bold">
                        {bill.paymentMethod || 'CASH'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        bill.status === 'COMPLETED' ? 'bg-theme-teal/20 text-emerald-800' : 
                        bill.status === 'RETURNED' ? 'bg-rose-100 text-rose-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {bill.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold text-[#1B2850]">
                      ₹{bill.grandTotal.toFixed(2)}
                    </td>
                    <td className="p-3 text-center">
                      <button className="text-slate-400 hover:text-theme-blue p-1 rounded transition-colors">
                        <ChevronRight className="w-4 h-4 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bill Details & Return Modal */}
      {isModalOpen && selectedBill && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-theme-white rounded-2xl shadow-2xl max-w-3xl w-full flex flex-col max-h-[90vh] overflow-hidden">
            
            <div className="bg-theme-navy text-white px-5 py-4 flex items-center justify-between shrink-0">
              <div>
                <h2 className="font-bold text-base flex items-center gap-2">
                  <Store className="w-5 h-5 text-theme-teal" />
                  Invoice Details: {selectedBill.invoiceNumber}
                </h2>
                <p className="text-[10px] text-slate-300 font-mono mt-0.5">
                  {new Date(selectedBill.createdAt).toLocaleString()} • {selectedBill.paymentMethod}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handlePrint(selectedBill._id)}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-xs font-bold rounded-lg transition-colors"
                >
                  Print Bill
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-theme-white/10 hover:bg-theme-white/20 flex items-center justify-center text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5 overflow-y-auto flex-1 font-mono text-xs">
              <div className="flex justify-between items-start mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 font-bold mb-1 block">Customer:</span>
                  <div className="font-bold text-theme-navy text-sm">{selectedBill.customerName || 'Walk-in'}</div>
                  <div className="text-slate-500">{selectedBill.customerMobile || 'N/A'}</div>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 font-bold mb-1 block">Bill Totals:</span>
                  <div className="text-slate-600">Sub: ₹{selectedBill.subtotal?.toFixed(2)} | Tax: ₹{selectedBill.tax?.toFixed(2)}</div>
                  <div className="font-black text-theme-navy text-base mt-1">Total: ₹{selectedBill.grandTotal?.toFixed(2)}</div>
                </div>
              </div>

              <h3 className="font-bold text-sm text-theme-navy mb-3">Line Items (Select to Return)</h3>
              
              <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 border-b border-slate-200 text-[10px] text-slate-500 uppercase">
                    <tr>
                      <th className="p-3 w-10 text-center">Ret</th>
                      <th className="p-3">Item</th>
                      <th className="p-3 text-right">Purchased</th>
                      <th className="p-3 text-right">Price</th>
                      <th className="p-3 text-right">Return Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedBill.items?.map((item: any) => {
                      const isReturnedItem = selectedBill.status === 'RETURNED'; // Simplification for UI
                      const isSelected = returnItems.some(i => i.productId === item.productId);
                      const returnObj = returnItems.find(i => i.productId === item.productId);

                      return (
                        <tr key={item.productId} className={isSelected ? 'bg-rose-50/50' : 'hover:bg-slate-50'}>
                          <td className="p-3 text-center">
                            <input 
                              type="checkbox" 
                              disabled={isReturnedItem}
                              checked={isSelected}
                              onChange={(e) => handleReturnItemToggle(item.productId, item.quantity, e.target.checked)}
                              className="rounded border-slate-300 text-rose-500 focus:ring-rose-500 cursor-pointer"
                            />
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-theme-navy">{item.productName || item.name}</div>
                            <div className="text-[9px] text-slate-400 uppercase">{item.sku}</div>
                          </td>
                          <td className="p-3 text-right font-bold text-slate-600">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="p-3 text-right">
                            ₹{(item.sellingPriceAtSale || item.price).toFixed(2)}
                          </td>
                          <td className="p-3 text-right">
                            {isSelected ? (
                              <input 
                                type="number" 
                                min={0.001}
                                max={item.quantity}
                                step="any"
                                value={returnObj?.quantity || ''}
                                onChange={(e) => handleReturnQtyChange(item.productId, parseFloat(e.target.value) || 0, item.quantity)}
                                className="w-20 px-2 py-1 border border-rose-300 rounded bg-white text-right font-bold text-rose-700 outline-none focus:border-rose-500"
                              />
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {returnItems.length > 0 && (
                <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 animate-in fade-in slide-in-from-bottom-2">
                  <div className="mb-3">
                    <label className="block font-bold text-rose-800 mb-1">Reason for Return</label>
                    <input 
                      type="text" 
                      value={returnReason}
                      onChange={e => setReturnReason(e.target.value)}
                      placeholder="e.g. Defective, Expired, Customer Request"
                      className="w-full px-3 py-2 rounded-lg border border-rose-200 focus:outline-none focus:border-rose-400 text-rose-900"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-rose-800">
                      Returning <span className="font-bold">{returnItems.length}</span> item(s).
                      Stock will be added back to inventory.
                    </div>
                    <button
                      onClick={handleProcessReturn}
                      disabled={isProcessingReturn}
                      className="flex items-center gap-2 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50"
                    >
                      <ArrowDownLeft className="w-4 h-4" />
                      {isProcessingReturn ? 'Processing...' : 'Confirm Return'}
                    </button>
                  </div>
                </div>
              )}

              {selectedBill.status === 'RETURNED' && (
                <div className="mt-4 p-3 bg-slate-100 border border-slate-200 rounded-lg text-center text-slate-500 font-bold">
                  This bill has already been marked as returned.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
