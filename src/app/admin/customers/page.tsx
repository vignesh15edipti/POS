'use client';

import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, X, History, Save, Edit, Trash2 } from 'lucide-react';
import { usePOS } from '../../../context/POSContext';

interface CustomerData {
  _id?: string;
  name: string;
  mobile: string;
  address?: string;
  gstin?: string;
  creditLimit: number;
  outstanding: number;
  points: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);

  const { showToast } = usePOS();

  const [formData, setFormData] = useState<CustomerData>({
    name: '',
    mobile: '',
    address: '',
    gstin: '',
    creditLimit: 0,
    outstanding: 0,
    points: 0
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      const json = await res.json();
      if (json.success) {
        setCustomers(json.data);
      }
    } catch (e) {
      console.error('Failed to fetch customers', e);
    }
  };

  const handleOpenModal = (customer?: CustomerData) => {
    if (customer) {
      setFormData(customer);
    } else {
      setFormData({
        name: '',
        mobile: '',
        address: '',
        gstin: '',
        creditLimit: 0,
        outstanding: 0,
        points: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = formData._id ? `/api/customers/${formData._id}` : '/api/customers';
      const method = formData._id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (json.success) {
        showToast(`✓ Customer ${formData._id ? 'updated' : 'saved'} successfully`);
        setIsModalOpen(false);
        fetchCustomers();
      } else {
        showToast(`❌ Error: ${json.error}`);
      }
    } catch (e: any) {
      showToast(`❌ Error: ${e.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showToast('✓ Customer deleted');
        fetchCustomers();
      } else {
        showToast(`❌ Error: ${json.error}`);
      }
    } catch (e: any) {
      showToast(`❌ Error: ${e.message}`);
    }
  };

  const handleViewHistory = async (customer: CustomerData) => {
    setSelectedCustomer(customer);
    try {
      const res = await fetch(`/api/customers/${customer._id}/points`);
      const json = await res.json();
      if (json.success) {
        setHistoryLogs(json.data);
        setIsHistoryModalOpen(true);
      } else {
        showToast(`❌ Failed to fetch points history`);
      }
    } catch (e) {
      showToast(`❌ Error fetching points history`);
    }
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.mobile.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-theme-white p-5 rounded-2xl border border-theme-gray-border shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2850] tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-theme-blue" />
            Customers & Points
          </h1>
          <p className="text-xs text-theme-gray-text font-mono mt-0.5">
            Manage customer profiles, credit limits, and reward points
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-theme-blue hover:bg-theme-blue text-white font-bold rounded-xl text-xs shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Customer</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-theme-white p-4 rounded-2xl border border-theme-gray-border shadow-xs flex items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-theme-gray-light border border-theme-gray-border rounded-xl text-xs font-mono"
          />
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-theme-white rounded-2xl border border-theme-gray-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-theme-gray-light text-theme-gray-text text-[10px] uppercase border-b border-theme-gray-border">
                <th className="p-3">Customer Details</th>
                <th className="p-3">Contact Info</th>
                <th className="p-3 text-right">Credit / Outst.</th>
                <th className="p-3 text-center">Reward Points</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c._id} className="hover:bg-theme-gray-light">
                  <td className="p-3">
                    <div className="font-bold text-theme-navy font-sans text-sm">{c.name}</div>
                    {c.gstin && <div className="text-[10px] text-theme-teal font-bold mt-0.5">GST: {c.gstin}</div>}
                  </td>
                  <td className="p-3 text-theme-gray-text">
                    <div className="font-bold">{c.mobile}</div>
                    <div className="text-[10px] truncate max-w-[150px]">{c.address || '-'}</div>
                  </td>
                  <td className="p-3 text-right">
                    <div className="font-bold text-theme-navy">Limit: ₹{c.creditLimit}</div>
                    <div className={`text-[10px] font-bold ${c.outstanding > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      Due: ₹{c.outstanding}
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-theme-orange-light text-theme-orange font-bold rounded-full">
                      {c.points} pts
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleViewHistory(c)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-theme-blue rounded-lg"
                        title="Points Ledger"
                      >
                        <History className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleOpenModal(c)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-theme-teal rounded-lg"
                        title="Edit Profile"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => c._id && handleDelete(c._id)}
                        className="p-1.5 bg-slate-100 hover:bg-rose-100 text-rose-500 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-400">
                    No customers found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-theme-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="bg-theme-navy text-white px-5 py-4 flex items-center justify-between">
              <h2 className="font-bold text-base">{formData._id ? 'Edit Customer' : 'Register New Member'}</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-theme-white/10 hover:bg-theme-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-4 text-xs font-mono max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-theme-navy mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                    placeholder="e.g. Ramesh Kumar"
                  />
                </div>
                <div>
                  <label className="block font-bold text-theme-navy mb-1">Mobile Phone *</label>
                  <input
                    type="text"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-theme-navy mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                  placeholder="e.g. 123 Main Street..."
                />
              </div>

              <div>
                <label className="block font-bold text-theme-navy mb-1">GSTIN (Optional)</label>
                <input
                  type="text"
                  value={formData.gstin || ''}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl uppercase"
                  placeholder="e.g. 33AABBC1234D1Z5"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-theme-navy mb-1">Credit Limit (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.creditLimit}
                    onChange={(e) => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-theme-navy mb-1">Reward Points Balance</label>
                  <input
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-xl font-bold text-theme-orange"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-bold text-theme-gray-text hover:bg-theme-gray-light transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-theme-blue hover:bg-theme-blue text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {formData._id ? 'Update Profile' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Points History Ledger Modal */}
      {isHistoryModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-theme-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-theme-navy text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-base flex items-center gap-2">
                  <History className="w-5 h-5 text-theme-orange" />
                  Points Ledger
                </h2>
                <p className="text-[10px] text-slate-300 font-mono mt-0.5">
                  {selectedCustomer.name} • {selectedCustomer.mobile} • Balance: {selectedCustomer.points} pts
                </p>
              </div>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="w-8 h-8 rounded-full bg-theme-white/10 hover:bg-theme-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto font-mono text-xs divide-y divide-slate-100">
              {historyLogs.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  No points history found for this customer.
                </div>
              ) : (
                historyLogs.map((log) => (
                  <div key={log._id} className="py-3 flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                          log.pointsChanged > 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {log.pointsChanged > 0 ? 'EARNED' : 'REDEEMED'}
                        </span>
                        <span className="text-slate-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-1 font-bold text-slate-800">
                        {log.reason} {log.billNumber && `(Bill #${log.billNumber})`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold text-sm ${log.pointsChanged > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {log.pointsChanged > 0 ? '+' : ''}{log.pointsChanged} pts
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold mt-0.5">
                        Bal: {log.balance}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
