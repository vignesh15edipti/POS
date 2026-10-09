'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Shield, Key } from 'lucide-react';

interface Employee {
  _id: string;
  name: string;
  employeeId: string;
  mobile: string;
  role: string;
  pin: string;
  status: string;
}

export default function BillersPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState('CASHIER');
  const [pin, setPin] = useState('');
  const [status, setStatus] = useState('active');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/employees');
      if (res.ok) {
        const json = await res.json();
        setEmployees(json.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch employees', error);
    }
    setIsLoading(false);
  };

  const handleOpenModal = (emp?: Employee) => {
    if (emp) {
      setEditingId(emp._id);
      setName(emp.name);
      setEmployeeId(emp.employeeId);
      setMobile(emp.mobile || '');
      setRole(emp.role);
      setPin(emp.pin);
      setStatus(emp.status);
    } else {
      setEditingId(null);
      setName('');
      setEmployeeId(`EMP${Math.floor(1000 + Math.random() * 9000)}`);
      setMobile('');
      setRole('CASHIER');
      setPin('');
      setStatus('active');
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !employeeId.trim() || !pin.trim()) return;

    const payload = { name, employeeId, mobile, role, pin, status };

    try {
      if (editingId) {
        await fetch(`/api/employees/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      setIsModalOpen(false);
      fetchEmployees();
    } catch (error) {
      console.error('Save failed', error);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2850]">Billers (Staff)</h1>
          <p className="text-xs text-slate-500 mt-1">Manage POS cashiers and their access PINs</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-theme-teal hover:bg-theme-teal/90 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Biller
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-slate-400">Loading billers...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-mono text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="p-4 font-bold">Staff Details</th>
                <th className="p-4 font-bold">Role</th>
                <th className="p-4 font-bold text-center">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map((emp) => (
                <tr key={emp._id} className="hover:bg-slate-50">
                  <td className="p-4">
                    <div className="font-bold text-slate-800">{emp.name}</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">{emp.employeeId} {emp.mobile && `• ${emp.mobile}`}</div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                      emp.role === 'OWNER' ? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      <Shield className="w-3 h-3" />
                      {emp.role}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {emp.status === 'active' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-bold">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full text-xs font-bold">
                        <XCircle className="w-3 h-3" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleOpenModal(emp)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400 font-medium">
                    No billers found. Create your first staff member!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">
                {editingId ? 'Edit Biller' : 'New Biller'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:border-theme-blue focus:ring-2 focus:ring-theme-blue/20 outline-none"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Employee ID *</label>
                  <input
                    type="text"
                    required
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-mono focus:border-theme-blue focus:ring-2 focus:ring-theme-blue/20 outline-none uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Mobile Number</label>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:border-theme-blue focus:ring-2 focus:ring-theme-blue/20 outline-none"
                  placeholder="e.g. 9876543210"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Role *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-theme-navy focus:border-theme-blue focus:ring-2 focus:ring-theme-blue/20 outline-none"
                  >
                    <option value="CASHIER">Cashier</option>
                    <option value="OWNER">Store Owner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Login PIN *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm font-mono font-bold tracking-widest focus:border-theme-blue focus:ring-2 focus:ring-theme-blue/20 outline-none"
                      placeholder="1234"
                    />
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Numbers only (4-6 digits)</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="status"
                  checked={status === 'active'}
                  onChange={(e) => setStatus(e.target.checked ? 'active' : 'inactive')}
                  className="w-4 h-4 rounded border-slate-300 text-theme-teal focus:ring-theme-teal"
                />
                <label htmlFor="status" className="text-sm font-medium text-slate-700">Account Active</label>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-theme-teal text-white font-bold text-sm hover:bg-theme-teal/90 transition-colors"
                >
                  Save Biller
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
