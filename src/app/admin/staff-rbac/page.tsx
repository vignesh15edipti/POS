'use client';

import React from 'react';
import { usePOS } from '../../../context/POSContext';
import { ShieldAlert, User, Check, X, ShieldCheck } from 'lucide-react';

const PERMISSIONS = [
  { feature: 'POS Cashier Checkout Terminal', admin: true, owner: true, cashier: true },
  { feature: 'Barcode Scanning & Quick Search', admin: true, owner: true, cashier: true },
  { feature: 'Apply Cart Line Discount (>10%)', admin: true, owner: true, cashier: false },
  { feature: 'Reprint / Void Duplicate Bills', admin: true, owner: true, cashier: false },
  { feature: 'Product & SKU Catalog Edit', admin: true, owner: true, cashier: false },
  { feature: 'Suppliers & Purchase Orders (PO)', admin: true, owner: true, cashier: false },
  { feature: 'GST Tax Reports & Financials', admin: true, owner: true, cashier: false },
  { feature: 'Staff Management & Role Assignment', admin: true, owner: false, cashier: false },
];

export default function StaffRBACPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-theme-white p-5 rounded-2xl border border-theme-gray-border shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2850] tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-theme-blue" />
            Role-Based Access Control (RBAC) & Staff Shifts
          </h1>
          <p className="text-xs text-theme-gray-text font-mono mt-0.5">
            Granular route access control, cashier counter permissions & discount override thresholds
          </p>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-theme-white p-6 rounded-2xl border border-theme-gray-border shadow-xs space-y-4">
        <h2 className="text-base font-bold text-[#1B2850] font-mono">
          Security Permission Matrix by User Role
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-theme-gray-light text-theme-gray-text text-[10px] uppercase border-b border-theme-gray-border">
                <th className="p-3">Feature / Module Access</th>
                <th className="p-3 text-center">Super Admin</th>
                <th className="p-3 text-center">Store Owner</th>
                <th className="p-3 text-center">Cashier Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PERMISSIONS.map((p, idx) => (
                <tr key={idx} className="hover:bg-theme-gray-light">
                  <td className="p-3 font-sans font-bold text-theme-navy">{p.feature}</td>
                  <td className="p-3 text-center">
                    <Check className="w-4 h-4 text-theme-teal mx-auto font-bold" />
                  </td>
                  <td className="p-3 text-center">
                    {p.owner ? (
                      <Check className="w-4 h-4 text-theme-teal mx-auto font-bold" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {p.cashier ? (
                      <Check className="w-4 h-4 text-theme-teal mx-auto font-bold" />
                    ) : (
                      <span className="text-[10px] text-theme-orange bg-amber-50 px-2 py-0.5 rounded font-bold">
                        Manager Override
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
