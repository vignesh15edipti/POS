'use client';

import React, { useState, useEffect } from 'react';
import { usePOS } from '../../../../context/POSContext';
import { Product } from '../../../../types/pos';
import { 
  AlertOctagon, Calendar, Package, AlertTriangle, ArrowRight, Activity, Beaker
} from 'lucide-react';
import Link from 'next/link';

export default function ExpiriesPage() {
  const { products, isLoadingProducts, fetchProducts, adjustStock } = usePOS();
  
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Extract all batches from all products that have expiryTracking
  let allBatches: { product: Product; batchNumber: string; expiryDate: Date; qty: number; status: 'EXPIRED' | 'EXPIRING_SOON' | 'GOOD' }[] = [];
  
  products.forEach(p => {
    if ((p as any).expiryTracking && p.batches && p.batches.length > 0) {
      p.batches.forEach(b => {
        if (b.qty > 0) {
          const expDate = new Date(b.expiryDate);
          const now = new Date();
          const daysToExpiry = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
          
          let status: 'EXPIRED' | 'EXPIRING_SOON' | 'GOOD' = 'GOOD';
          if (daysToExpiry < 0) status = 'EXPIRED';
          else if (daysToExpiry <= 30) status = 'EXPIRING_SOON';
          
          allBatches.push({
            product: p,
            batchNumber: b.batchNumber,
            expiryDate: expDate,
            qty: b.qty,
            status
          });
        }
      });
    }
  });

  // Sort batches: Expired first, then closest to expiry
  allBatches.sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime());

  const expiredBatches = allBatches.filter(b => b.status === 'EXPIRED');
  const expiringSoonBatches = allBatches.filter(b => b.status === 'EXPIRING_SOON');
  const goodBatches = allBatches.filter(b => b.status === 'GOOD');

  const handleDiscard = async (productId: string, batchNumber: string, qty: number) => {
    if (confirm(`Are you sure you want to discard ${qty} units from batch ${batchNumber}? This will deduct stock permanently.`)) {
      await adjustStock(productId, 'EXPIRY', -qty, 'Discarded expired batch', batchNumber, undefined);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-theme-white p-5 rounded-2xl border border-theme-gray-border shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-rose-600 tracking-tight flex items-center gap-2">
            <AlertOctagon className="w-6 h-6" />
            Expiry & Batch Tracking
          </h1>
          <p className="text-xs text-theme-gray-text font-mono mt-0.5">
            Monitor products nearing expiration and manage expired stock physically.
          </p>
        </div>
        
        <Link
          href="/admin/inventory"
          className="flex items-center gap-2 px-4 py-2.5 bg-theme-gray-light hover:bg-slate-200 text-theme-navy font-bold rounded-xl text-xs shadow-sm transition-all active:scale-95 shrink-0"
        >
          <Package className="w-4 h-4" />
          <span>Back to Master Inventory</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono font-bold text-rose-600 uppercase">Already Expired</p>
            <p className="text-3xl font-bold text-rose-700 mt-1">{expiredBatches.length}</p>
          </div>
          <AlertOctagon className="w-10 h-10 text-rose-300" />
        </div>
        
        <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono font-bold text-amber-700 uppercase">Expiring in 30 Days</p>
            <p className="text-3xl font-bold text-amber-800 mt-1">{expiringSoonBatches.length}</p>
          </div>
          <AlertTriangle className="w-10 h-10 text-amber-300" />
        </div>

        <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono font-bold text-emerald-700 uppercase">Healthy Batches</p>
            <p className="text-3xl font-bold text-emerald-800 mt-1">{goodBatches.length}</p>
          </div>
          <Activity className="w-10 h-10 text-emerald-300" />
        </div>
      </div>

      {/* Tables Section */}
      <div className="bg-theme-white rounded-2xl border border-theme-gray-border shadow-xs overflow-hidden">
        <div className="p-4 border-b border-theme-gray-border flex items-center justify-between bg-slate-50">
          <h2 className="text-sm font-bold text-theme-navy flex items-center gap-2 uppercase font-mono">
            <Beaker className="w-4 h-4 text-theme-blue" />
            Batch Monitoring Dashboard
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-theme-gray-light text-theme-gray-text text-[10px] uppercase border-b border-theme-gray-border">
                <th className="p-3">Product Name & SKU</th>
                <th className="p-3">Batch Number</th>
                <th className="p-3">Expiry Date</th>
                <th className="p-3 text-center">Batch Stock</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoadingProducts ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">Loading batch data...</td>
                </tr>
              ) : allBatches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No products have batch/expiry tracking enabled or no active batches found.
                  </td>
                </tr>
              ) : (
                allBatches.map((b, idx) => {
                  const isExpired = b.status === 'EXPIRED';
                  const isWarning = b.status === 'EXPIRING_SOON';
                  
                  return (
                    <tr key={`${b.product.id}-${b.batchNumber}-${idx}`} className="hover:bg-slate-50">
                      <td className="p-3">
                        <div className="font-bold text-theme-navy font-sans">{b.product.name}</div>
                        <div className="text-[10px] text-theme-blue font-bold">SKU: {b.product.sku}</div>
                      </td>
                      <td className="p-3 font-bold text-slate-600">
                        {b.batchNumber}
                      </td>
                      <td className="p-3">
                        <div className={`flex items-center gap-1.5 font-bold ${isExpired ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-emerald-600'}`}>
                          <Calendar className="w-3.5 h-3.5" />
                          {b.expiryDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                      </td>
                      <td className="p-3 text-center font-bold text-theme-navy">
                        {b.qty} {b.product.unit}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isExpired ? 'bg-rose-100 text-rose-800' : 
                          isWarning ? 'bg-amber-100 text-amber-800' : 
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {b.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {isExpired && (
                          <button
                            onClick={() => handleDiscard(b.product.id, b.batchNumber, b.qty)}
                            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[10px] shadow-sm transition-all"
                          >
                            Discard Batch
                          </button>
                        )}
                        {!isExpired && (
                           <span className="text-slate-400 text-[10px] italic">N/A</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
