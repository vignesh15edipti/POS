'use client';

import React, { useEffect, useState } from 'react';
import { LineChart, DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

interface ProfitData {
  totalRevenue: number;
  totalCogs: number;
  grossProfit: number;
  totalExpenses: number;
  netProfit: number;
  totalTax: number;
}

export default function ProfitReportPage() {
  const [data, setData] = useState<ProfitData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Date range
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?type=profit&startDate=${startDate}&endDate=${endDate}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (error) {
      console.error('Failed to fetch profit report:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2850]">Profit & Loss Report</h1>
          <p className="text-xs text-slate-500 mt-1">Financial performance summary</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 px-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="text-sm border-none bg-transparent outline-none font-medium text-slate-700 cursor-pointer"
            />
          </div>
          <span className="text-slate-300">to</span>
          <div className="flex items-center gap-2 px-2">
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="text-sm border-none bg-transparent outline-none font-medium text-slate-700 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 font-medium">Calculating financials...</div>
      ) : data ? (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <DollarSign className="w-20 h-20 text-emerald-600 -mr-6 -mt-6" />
              </div>
              <p className="text-sm font-bold text-slate-500 mb-1">Total Sales Revenue</p>
              <h3 className="text-2xl font-bold text-slate-800">₹{data.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h3>
              <p className="text-[10px] text-slate-400 mt-2">Excluding GST</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <TrendingDown className="w-20 h-20 text-rose-600 -mr-6 -mt-6" />
              </div>
              <p className="text-sm font-bold text-slate-500 mb-1">Cost of Goods (COGS)</p>
              <h3 className="text-2xl font-bold text-slate-800">₹{data.totalCogs.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h3>
              <p className="text-[10px] text-slate-400 mt-2">Purchase cost of sold items</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <TrendingDown className="w-20 h-20 text-orange-600 -mr-6 -mt-6" />
              </div>
              <p className="text-sm font-bold text-slate-500 mb-1">Shop Expenses</p>
              <h3 className="text-2xl font-bold text-slate-800">₹{data.totalExpenses.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h3>
              <p className="text-[10px] text-slate-400 mt-2">Operational overheads</p>
            </div>
            
            <div className={`p-6 rounded-2xl border shadow-sm relative overflow-hidden group ${
              data.netProfit >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
            }`}>
              <div className="absolute top-0 right-0 p-4 opacity-20 transition-opacity">
                <TrendingUp className={`w-20 h-20 -mr-6 -mt-6 ${data.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`} />
              </div>
              <p className={`text-sm font-bold mb-1 ${data.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>Net Profit</p>
              <h3 className={`text-3xl font-bold ${data.netProfit >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
                ₹{data.netProfit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </h3>
              <p className={`text-[10px] mt-2 font-bold ${data.netProfit >= 0 ? 'text-emerald-600/80' : 'text-rose-600/80'}`}>
                {data.totalRevenue > 0 ? ((data.netProfit / data.totalRevenue) * 100).toFixed(1) : 0}% Margin
              </p>
            </div>
          </div>

          {/* Statement View */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <LineChart className="w-5 h-5 text-theme-blue" />
              <h3 className="font-bold text-slate-800">Income Statement Summary</h3>
            </div>
            <div className="p-6 max-w-2xl mx-auto space-y-4 font-mono text-sm">
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-600">Total Sales Revenue</span>
                <span className="font-bold text-emerald-600">₹{data.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center py-2 text-rose-500 border-b border-slate-200 pb-4">
                <span>Less: Cost of Goods Sold</span>
                <span>(₹{data.totalCogs.toLocaleString('en-IN', { minimumFractionDigits: 2 })})</span>
              </div>
              
              <div className="flex justify-between items-center py-4 font-bold text-base text-slate-800 bg-slate-50/50 -mx-6 px-6">
                <span>Gross Profit</span>
                <span>₹{data.grossProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between items-center py-2 text-rose-500 border-b border-slate-200 pb-4">
                <span>Less: Operating Expenses</span>
                <span>(₹{data.totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })})</span>
              </div>
              
              <div className={`flex justify-between items-center py-4 font-bold text-xl -mx-6 px-6 ${
                data.netProfit >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}>
                <span>Net Profit {data.netProfit < 0 && '(Loss)'}</span>
                <span>₹{data.netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              
              <div className="mt-8 pt-4 border-t border-dashed border-slate-200 text-xs text-slate-400 text-center">
                Note: Total GST Collected during this period was ₹{data.totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}. 
                Taxes are excluded from revenue and profit calculations.
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
