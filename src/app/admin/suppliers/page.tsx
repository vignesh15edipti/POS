'use client';

import React, { useState } from 'react';
import { usePOS } from '../../../context/POSContext';
import { Truck, Plus, Phone, Mail, FileText, CheckCircle2, X } from 'lucide-react';

export default function SuppliersPage() {
  const { suppliers, addSupplier } = usePOS();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    gstin: '24AAAAA0000A1Z5',
    categories: ['Groceries & Staples'] as any
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSupplier(formData);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-theme-white p-5 rounded-2xl border border-theme-gray-border shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2850] tracking-tight flex items-center gap-2">
            <Truck className="w-6 h-6 text-theme-blue" />
            Suppliers & Purchase Orders (PO) Network
          </h1>
          <p className="text-xs text-theme-gray-text font-mono mt-0.5">
            FMCG distribution vendors, GSTIN verification, reorder stock PO vouchers & accounts payable
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-theme-blue hover:bg-theme-blue text-white font-bold rounded-xl text-xs shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Vendor</span>
        </button>
      </div>

      {/* Supplier Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {suppliers.map((s) => (
          <div key={s.id} className="bg-theme-white p-5 rounded-2xl border border-theme-gray-border shadow-xs space-y-3 font-mono">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">ID: #{s.id}</span>
                <h3 className="font-bold font-sans text-base text-theme-navy leading-snug">{s.name}</h3>
                <p className="text-xs text-theme-gray-text font-sans mt-0.5">Contact: {s.contactPerson}</p>
              </div>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-800 text-[10px] font-bold rounded">
                GSTIN OK
              </span>
            </div>

            <div className="space-y-1 text-xs text-theme-gray-text pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{s.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{s.email}</span>
              </div>
              <div className="text-[11px] text-theme-gray-text pt-1">
                GSTIN: <span className="font-bold text-theme-navy">{s.gstin}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Pending POs</span>
                <span className="font-bold text-theme-navy">{s.pendingOrdersCount} Vouchers</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase">Payable Balance</span>
                <span className="font-bold text-rose-600">₹{s.totalBalance.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-theme-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-theme-navy text-white px-5 py-4 flex items-center justify-between">
              <h2 className="font-bold text-base">Register Vendor Supplier</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-theme-white/10 hover:bg-theme-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-4 text-xs font-mono">
              <div>
                <label className="block font-bold text-theme-navy mb-1">Company / Vendor Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                  placeholder="e.g. Nestle India Distributors"
                />
              </div>

              <div>
                <label className="block font-bold text-theme-navy mb-1">Contact Representative</label>
                <input
                  type="text"
                  required
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-theme-navy mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-theme-navy mb-1">GSTIN</label>
                  <input
                    type="text"
                    required
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-mono uppercase"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-theme-blue text-white font-bold rounded-xl shadow-xs"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
