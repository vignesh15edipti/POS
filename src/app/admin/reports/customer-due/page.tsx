'use client';

import React, { useEffect, useState } from 'react';
import { Users, Phone } from 'lucide-react';

export default function CustomerDueReportPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports?type=customer-due')
      .then(res => res.json())
      .then(json => {
        if (json.success) setData(json.data);
        setLoading(false);
      });
  }, []);

  const totalDue = data.reduce((sum, item) => sum + (item.totalOutstanding || 0), 0);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2850]">Customer Due Report</h1>
          <p className="text-xs text-slate-500 mt-1">Outstanding credit payments from customers</p>
        </div>
        <div className="bg-orange-50 text-orange-700 px-4 py-2 rounded-xl border border-orange-200">
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Total Market Outstanding</p>
          <p className="text-xl font-bold">₹{totalDue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-140px)]">
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="text-center py-20 text-slate-400">Loading...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 sticky top-0 text-slate-500 font-mono text-[10px] uppercase shadow-sm">
                <tr>
                  <th className="p-4 font-bold">Customer Name</th>
                  <th className="p-4 font-bold">Mobile Number</th>
                  <th className="p-4 font-bold text-right">Outstanding Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((item: any, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-theme-navy">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-theme-blue" />
                        {item.name}
                      </div>
                    </td>
                    <td className="p-4 text-slate-500">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {item.mobile}
                      </div>
                    </td>
                    <td className="p-4 text-right font-bold text-rose-600 text-lg">
                      ₹{item.totalOutstanding.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-slate-400">
                      No outstanding dues from customers.
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
