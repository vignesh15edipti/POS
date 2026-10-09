'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle, Download } from 'lucide-react';

export default function LowStockReportPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports?type=low-stock')
      .then(res => res.json())
      .then(json => {
        if (json.success) setData(json.data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2850]">Low Stock Report</h1>
          <p className="text-xs text-slate-500 mt-1">Items at or below minimum reorder levels</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-140px)]">
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="text-center py-20 text-slate-400">Loading...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-rose-50 sticky top-0 text-rose-700 font-mono text-[10px] uppercase shadow-sm">
                <tr>
                  <th className="p-4 font-bold">Product Name</th>
                  <th className="p-4 font-bold">SKU</th>
                  <th className="p-4 font-bold text-center">Current Stock</th>
                  <th className="p-4 font-bold text-center">Minimum Required</th>
                  <th className="p-4 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((item: any, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-theme-navy">{item.name}</td>
                    <td className="p-4 text-slate-500 font-mono text-xs">{item.sku}</td>
                    <td className="p-4 text-center font-bold text-rose-600">{item.quantity} {item.unit}</td>
                    <td className="p-4 text-center text-slate-600">{item.minimumStock || 5} {item.unit}</td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-700 px-2 py-0.5 rounded text-[10px] font-bold">
                        <AlertTriangle className="w-3 h-3" /> Reorder Now
                      </span>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      All products have sufficient stock.
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
