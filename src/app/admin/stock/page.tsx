'use client';

import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, ArrowUpRight, ArrowDownRight, Package, CheckCircle2 } from 'lucide-react';
import { usePOS } from '../../../context/POSContext';

export default function StockPage() {
  const { products, fetchProducts, isLoadingProducts } = usePOS();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock <= 0) return { label: 'Out of Stock', color: 'text-rose-600 bg-rose-50 border-rose-200' };
    if (stock <= minStock) return { label: 'Low Stock', color: 'text-orange-600 bg-orange-50 border-orange-200' };
    return { label: 'In Stock', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === 'LOW_STOCK') {
      matchesStatus = p.stockQuantity <= p.minimumStock && p.stockQuantity > 0;
    } else if (statusFilter === 'OUT_OF_STOCK') {
      matchesStatus = p.stockQuantity <= 0;
    } else if (statusFilter === 'IN_STOCK') {
      matchesStatus = p.stockQuantity > p.minimumStock;
    }

    return matchesSearch && matchesStatus;
  });

  const totalStockValue = filteredProducts.reduce((sum, p) => sum + (p.purchasePrice * p.stockQuantity), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2850]">Stock Status</h1>
          <p className="text-xs text-slate-500 mt-1">Monitor real-time inventory levels</p>
        </div>
        <div className="bg-theme-navy text-white px-4 py-2 rounded-xl flex items-center gap-3 shadow-md">
          <div className="p-1.5 bg-white/10 rounded-lg"><Package className="w-4 h-4" /></div>
          <div>
            <p className="text-[10px] font-medium text-slate-300">Total Stock Value (Cost)</p>
            <p className="text-lg font-bold">₹{totalStockValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-140px)]">
        {/* Filters */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-4 bg-slate-50">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-theme-blue/20 outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex gap-2">
            {['ALL', 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  statusFilter === status 
                    ? 'bg-theme-blue text-white shadow-sm' 
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {status.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-y-auto flex-1">
          {isLoadingProducts ? (
            <div className="text-center py-10 text-slate-400">Loading stock data...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 sticky top-0 text-slate-500 font-mono text-[10px] uppercase shadow-sm z-10">
                <tr>
                  <th className="p-4 font-bold">Product Details</th>
                  <th className="p-4 font-bold">Warehouse</th>
                  <th className="p-4 font-bold">Cost Price</th>
                  <th className="p-4 font-bold">Current Stock</th>
                  <th className="p-4 font-bold">Min Stock</th>
                  <th className="p-4 font-bold">Stock Value</th>
                  <th className="p-4 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map(p => {
                  const status = getStockStatus(p.stockQuantity, p.minimumStock);
                  const stockValue = p.purchasePrice * p.stockQuantity;
                  
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{p.name}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{p.sku} | {p.category}</div>
                      </td>
                      <td className="p-4 text-slate-600 font-medium">Main Store</td>
                      <td className="p-4 text-slate-600">₹{p.purchasePrice}</td>
                      <td className="p-4">
                        <span className="font-bold text-theme-navy text-base">{p.stockQuantity}</span>
                        <span className="text-xs text-slate-400 ml-1">{p.unit}</span>
                      </td>
                      <td className="p-4 text-slate-600">{p.minimumStock} {p.unit}</td>
                      <td className="p-4 font-bold text-theme-teal">₹{stockValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${status.color}`}>
                          {status.label === 'Low Stock' || status.label === 'Out of Stock' ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                      No stock records found for the selected filters.
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
