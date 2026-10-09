'use client';

import React from 'react';
import { usePOS } from '../../../context/POSContext';
import { FileBarChart, Download, IndianRupee, Percent, CheckCircle2 } from 'lucide-react';

const HSN_SUMMARY = [
  { hsn: '1101', name: 'Atta & Flours', uqc: 'PKT', qty: 142, taxableVal: 34780, cgst: 869.5, sgst: 869.5, rate: '5%' },
  { hsn: '1512', name: 'Refined Oils', uqc: 'LTR', qty: 215, taxableVal: 28380, cgst: 709.5, sgst: 709.5, rate: '5%' },
  { hsn: '1905', name: 'Biscuits & Bakery', uqc: 'PKT', qty: 380, taxableVal: 44840, cgst: 4035.6, sgst: 4035.6, rate: '18%' },
  { hsn: '0401', name: 'Toned Milk & Dairy', uqc: 'PKT', qty: 520, taxableVal: 35360, cgst: 0, sgst: 0, rate: '0%' },
  { hsn: '3305', name: 'Shampoo & Cosmetics', uqc: 'PCS', qty: 94, taxableVal: 26790, cgst: 2411.1, sgst: 2411.1, rate: '18%' },
];

export default function TaxReportsPage() {
  const { showToast } = usePOS();

  const handleExportCSV = () => {
    showToast('📥 Downloading GSTR-1 B2C Sales Report CSV...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-theme-white p-5 rounded-2xl border border-theme-gray-border shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2850] tracking-tight flex items-center gap-2">
            <FileBarChart className="w-6 h-6 text-theme-blue" />
            GST Tax Reports & HSN Analytics
          </h1>
          <p className="text-xs text-theme-gray-text font-mono mt-0.5">
            Automated GSTR-1, GSTR-3B tax liability summaries & HSN-wise sales audit breakdown
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-theme-teal hover:bg-theme-teal text-white font-bold rounded-xl text-xs shadow-sm transition-all shrink-0 font-mono"
        >
          <Download className="w-4 h-4" />
          <span>Export GSTR-1 CSV</span>
        </button>
      </div>

      {/* Tax Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 font-mono">
        <div className="bg-theme-white p-5 rounded-2xl border border-theme-gray-border shadow-xs space-y-2">
          <span className="text-xs text-slate-400 font-bold uppercase">Total Taxable Sales</span>
          <div className="text-2xl font-bold text-[#1B2850]">₹2,14,580.00</div>
          <span className="text-[10px] text-theme-teal font-bold">B2C Retail Outlets</span>
        </div>

        <div className="bg-theme-white p-5 rounded-2xl border border-theme-gray-border shadow-xs space-y-2">
          <span className="text-xs text-slate-400 font-bold uppercase">CGST Liability (2.5%-9%)</span>
          <div className="text-2xl font-bold text-theme-blue">₹10,517.85</div>
          <span className="text-[10px] text-theme-gray-text">Central Tax Account</span>
        </div>

        <div className="bg-theme-white p-5 rounded-2xl border border-theme-gray-border shadow-xs space-y-2">
          <span className="text-xs text-slate-400 font-bold uppercase">SGST Liability (2.5%-9%)</span>
          <div className="text-2xl font-bold text-theme-blue">₹10,517.85</div>
          <span className="text-[10px] text-theme-gray-text">State Tax Account</span>
        </div>

        <div className="bg-theme-white p-5 rounded-2xl border border-theme-gray-border shadow-xs space-y-2">
          <span className="text-xs text-slate-400 font-bold uppercase">Net Total GST Due</span>
          <div className="text-2xl font-bold text-theme-teal">₹21,035.70</div>
          <span className="text-[10px] text-theme-teal font-bold">Ready for Return File</span>
        </div>
      </div>

      {/* HSN Summary Table */}
      <div className="bg-theme-white p-5 rounded-2xl border border-theme-gray-border shadow-xs space-y-4">
        <h2 className="text-base font-bold text-[#1B2850] font-mono">
          HSN-wise Tax Summary Table (Chapter 1 - 99)
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-theme-gray-light text-theme-gray-text text-[10px] uppercase border-b border-theme-gray-border">
                <th className="p-3">HSN Code</th>
                <th className="p-3">Description</th>
                <th className="p-3 text-center">GST Rate</th>
                <th className="p-3 text-center">Total Qty</th>
                <th className="p-3 text-right">Taxable Value</th>
                <th className="p-3 text-right">CGST</th>
                <th className="p-3 text-right">SGST</th>
                <th className="p-3 text-right">Total GST</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {HSN_SUMMARY.map((row) => {
                const totalGst = row.cgst + row.sgst;
                return (
                  <tr key={row.hsn} className="hover:bg-theme-gray-light">
                    <td className="p-3 font-bold text-theme-blue">{row.hsn}</td>
                    <td className="p-3 font-sans font-medium text-theme-navy">{row.name}</td>
                    <td className="p-3 text-center font-bold text-theme-navy">{row.rate}</td>
                    <td className="p-3 text-center font-bold">{row.qty} {row.uqc}</td>
                    <td className="p-3 text-right font-bold text-theme-navy">₹{row.taxableVal.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right text-theme-gray-text">₹{row.cgst.toFixed(2)}</td>
                    <td className="p-3 text-right text-theme-gray-text">₹{row.sgst.toFixed(2)}</td>
                    <td className="p-3 text-right font-bold text-theme-teal">₹{totalGst.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
