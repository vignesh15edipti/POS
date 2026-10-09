'use client';

import React, { useEffect, useState } from 'react';
import { Save, Receipt, Hash } from 'lucide-react';
import { usePOS } from '../../../../context/POSContext';

export default function InvoiceSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    salesInvoicePrefix: '',
    purchaseInvoicePrefix: '',
  });

  const { showToast } = usePOS();

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          setFormData({
            salesInvoicePrefix: json.data.salesInvoicePrefix || 'INV-',
            purchaseInvoicePrefix: json.data.purchaseInvoicePrefix || 'PUR-',
          });
        }
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value.toUpperCase() });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Invoice settings updated successfully!');
      } else {
        showToast('Failed to update settings', 'error');
      }
    } catch (e) {
      showToast('Error updating settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-400">Loading settings...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2850]">Invoice & Numbering</h1>
          <p className="text-xs text-slate-500 mt-1">Configure your invoice prefixes and billing rules</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-theme-teal hover:bg-theme-teal/90 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm disabled:opacity-50 transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 bg-theme-orange/10 rounded-xl flex items-center justify-center">
            <Receipt className="w-5 h-5 text-theme-orange" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Prefix Configuration</h3>
            <p className="text-xs text-slate-500">Set the default prefix for all auto-generated bills.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Sales Invoice Prefix *</label>
            <div className="relative">
              <input
                type="text"
                name="salesInvoicePrefix"
                value={formData.salesInvoicePrefix}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold focus:border-theme-blue focus:ring-2 focus:ring-theme-blue/20 outline-none uppercase"
              />
              <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Example output: {formData.salesInvoicePrefix || 'INV-'}0001</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Purchase Order Prefix *</label>
            <div className="relative">
              <input
                type="text"
                name="purchaseInvoicePrefix"
                value={formData.purchaseInvoicePrefix}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold focus:border-theme-blue focus:ring-2 focus:ring-theme-blue/20 outline-none uppercase"
              />
              <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Example output: {formData.purchaseInvoicePrefix || 'PUR-'}0001</p>
          </div>
        </div>
      </div>
    </div>
  );
}
