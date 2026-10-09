'use client';

import React, { useEffect, useState } from 'react';
import { Save, Store, Phone, MapPin, Hash, Shield } from 'lucide-react';
import { usePOS } from '../../../../context/POSContext';

export default function ShopSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    shopName: '',
    shopAddress: '',
    shopPhone: '',
    gstin: '',
  });

  const { showToast } = usePOS();

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          setFormData({
            shopName: json.data.shopName || '',
            shopAddress: json.data.shopAddress || '',
            shopPhone: json.data.shopPhone || '',
            gstin: json.data.gstin || '',
          });
        }
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        showToast('Shop details updated successfully!');
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
          <h1 className="text-2xl font-bold text-[#1B2850]">Shop Profile</h1>
          <p className="text-xs text-slate-500 mt-1">Manage your primary store details and branding</p>
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
          <div className="w-10 h-10 bg-theme-blue/10 rounded-xl flex items-center justify-center">
            <Store className="w-5 h-5 text-theme-blue" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Basic Information</h3>
            <p className="text-xs text-slate-500">This information appears on your receipts and reports.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Store / Business Name *</label>
              <div className="relative">
                <input
                  type="text"
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-theme-navy focus:border-theme-blue focus:ring-2 focus:ring-theme-blue/20 outline-none"
                />
                <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Contact Phone *</label>
              <div className="relative">
                <input
                  type="text"
                  name="shopPhone"
                  value={formData.shopPhone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-theme-blue focus:ring-2 focus:ring-theme-blue/20 outline-none"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">GSTIN / Registration Number</label>
              <div className="relative">
                <input
                  type="text"
                  name="gstin"
                  value={formData.gstin}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:border-theme-blue focus:ring-2 focus:ring-theme-blue/20 outline-none uppercase"
                />
                <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Required for legal tax invoices.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Complete Address *</label>
            <div className="relative h-full max-h-[178px]">
              <textarea
                name="shopAddress"
                value={formData.shopAddress}
                onChange={handleChange}
                className="w-full h-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-theme-blue focus:ring-2 focus:ring-theme-blue/20 outline-none resize-none"
              />
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-theme-blue/5 border border-theme-blue/20 p-4 rounded-xl flex items-start gap-3">
        <Shield className="w-5 h-5 text-theme-blue shrink-0 mt-0.5" />
        <p className="text-sm text-theme-navy">
          <span className="font-bold">Important:</span> Changing your GSTIN or legal business name may require resetting invoice sequences for compliance. Consult your accountant before making changes mid-financial year.
        </p>
      </div>
    </div>
  );
}
