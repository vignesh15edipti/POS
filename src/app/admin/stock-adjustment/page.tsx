'use client';

import React, { useState, useEffect } from 'react';
import { Search, History, AlertCircle } from 'lucide-react';
import { usePOS } from '../../../context/POSContext';
import { Product } from '../../../types/pos';

export default function StockAdjustmentPage() {
  const { products, fetchProducts, adjustStock, stockHistoryLogs, fetchStockHistory, showToast } = usePOS();
  
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [amount, setAmount] = useState<number>(1);
  const [type, setType] = useState<string>('ADJUSTMENT_IN');
  const [reason, setReason] = useState<string>('Damage');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    fetchProducts();
    fetchStockHistory();
  }, [fetchProducts, fetchStockHistory]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 50); // limit to 50 for performance

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (amount <= 0) {
      showToast('Amount must be greater than 0', 'error');
      return;
    }

    try {
      let finalType = type;
      if (type === 'ADJUSTMENT' && ['Damage', 'Wastage', 'Expiry'].includes(reason)) {
        finalType = 'ADJUSTMENT_OUT';
      }

      await adjustStock(
        selectedProduct.id,
        finalType.includes('OUT') ? -amount : amount,
        finalType,
        reason + (notes ? ` - ${notes}` : ''),
        '',
        ''
      );
      
      setSelectedProduct(null);
      setAmount(1);
      setReason('Damage');
      setNotes('');
      setSearch('');
      fetchStockHistory();
    } catch (error) {
      console.error('Stock adjustment failed', error);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2850]">Stock Adjustment</h1>
          <p className="text-xs text-slate-500 mt-1">Record physical count discrepancies, damages, or wastage</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Product Selection */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[600px]">
          <h3 className="font-bold text-slate-800 mb-4">Select Product</h3>
          
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search product by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-theme-blue/20 outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex-1 overflow-y-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 sticky top-0 text-slate-500 font-mono text-[10px] uppercase">
                <tr>
                  <th className="p-3 font-bold">Product</th>
                  <th className="p-3 font-bold">Current Stock</th>
                  <th className="p-3 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-slate-800">{p.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{p.sku}</div>
                    </td>
                    <td className="p-3 font-bold text-theme-navy">{p.stockQuantity} {p.unit}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedProduct(p)}
                        className={`px-3 py-1 font-bold rounded-lg text-xs transition-colors ${
                          selectedProduct?.id === p.id 
                            ? 'bg-theme-teal text-white' 
                            : 'bg-theme-blue/10 text-theme-blue hover:bg-theme-blue/20'
                        }`}
                      >
                        {selectedProduct?.id === p.id ? 'Selected' : 'Select'}
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-slate-400 text-sm">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Adjustment Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[600px] overflow-y-auto">
          <h3 className="font-bold text-slate-800 mb-4">Adjustment Details</h3>

          {!selectedProduct ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl p-8">
              <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm font-medium">Please select a product from the left to continue.</p>
            </div>
          ) : (
            <form onSubmit={handleAdjust} className="space-y-5">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs font-bold text-slate-500 mb-1">Selected Product</p>
                <p className="font-bold text-theme-navy text-lg">{selectedProduct.name}</p>
                <div className="flex gap-4 mt-2 text-sm">
                  <p><span className="text-slate-500">SKU:</span> <span className="font-mono font-bold">{selectedProduct.sku}</span></p>
                  <p><span className="text-slate-500">Current Stock:</span> <span className="font-bold text-theme-teal">{selectedProduct.stockQuantity} {selectedProduct.unit}</span></p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">Adjustment Type</label>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setType('ADJUSTMENT_OUT')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                      type === 'ADJUSTMENT_OUT' ? 'bg-white shadow-sm text-rose-600' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Subtract (-)
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('ADJUSTMENT_IN')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                      type === 'ADJUSTMENT_IN' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Add (+)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">Quantity ({selectedProduct.unit})</label>
                <input
                  type="number"
                  min="0.001"
                  step="any"
                  required
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-lg focus:ring-2 focus:ring-theme-blue/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">Reason</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-theme-blue/20 outline-none"
                >
                  <option value="Damage">Damage</option>
                  <option value="Wastage">Wastage</option>
                  <option value="Expiry">Expiry</option>
                  <option value="Physical Count">Physical Count</option>
                  <option value="Correction">Correction</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-theme-blue/20 outline-none resize-none h-20"
                  placeholder="Additional details..."
                />
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-theme-blue hover:bg-theme-blue/90 text-white font-bold rounded-xl shadow-sm transition-colors text-sm"
                >
                  Submit Adjustment
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
