'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, DollarSign, Calendar } from 'lucide-react';
import { usePOS } from '../../../context/POSContext';

interface Expense {
  _id: string;
  category: string;
  amount: number;
  expenseDate: string;
  paymentMethod: string;
  description: string;
  reference: string;
}

interface ExpenseCategory {
  _id: string;
  name: string;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [description, setDescription] = useState('');
  const [reference, setReference] = useState('');

  const { showToast } = usePOS();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [expRes, catRes] = await Promise.all([
        fetch('/api/expenses?limit=100'),
        fetch('/api/expense-categories?active=true')
      ]);
      
      if (expRes.ok) {
        const expData = await expRes.json();
        setExpenses(expData.data || []);
      }
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData || []);
        if (catData.length > 0) setCategory(catData[0].name);
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
      showToast('Failed to load expenses', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredExpenses = expenses.filter(e => 
    e.category.toLowerCase().includes(search.toLowerCase()) ||
    (e.description && e.description.toLowerCase().includes(search.toLowerCase())) ||
    (e.reference && e.reference.toLowerCase().includes(search.toLowerCase()))
  );

  const totalExpense = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleOpenModal = () => {
    setAmount('');
    setExpenseDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('CASH');
    setDescription('');
    setReference('');
    if (categories.length > 0) setCategory(categories[0].name);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !amount) {
      showToast('Category and amount are required', 'error');
      return;
    }

    const payload = { 
      category, 
      amount: Number(amount), 
      expenseDate, 
      paymentMethod, 
      description, 
      reference 
    };

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Expense recorded successfully');
        setIsModalOpen(false);
        fetchData();
      } else {
        showToast(data.error || 'Failed to save expense', 'error');
      }
    } catch (error) {
      console.error('Save failed', error);
      showToast('Error recording expense', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense record?')) return;
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Expense deleted');
        fetchData();
      }
    } catch (error) {
      showToast('Failed to delete', 'error');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2850]">Expenses Ledger</h1>
          <p className="text-xs text-slate-500 mt-1">Record and track operational shop expenses</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-rose-50 text-rose-700 px-4 py-2 rounded-xl border border-rose-200">
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Total Expense</p>
            <p className="text-lg font-bold">₹{totalExpense.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
          </div>
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 bg-theme-teal hover:bg-theme-teal/90 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm h-[52px]"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-160px)]">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-theme-blue/20 outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {isLoading ? (
            <div className="text-center py-10 text-slate-400">Loading expenses...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 sticky top-0 text-slate-500 font-mono text-[10px] uppercase shadow-sm">
                <tr>
                  <th className="p-4 font-bold">Date</th>
                  <th className="p-4 font-bold">Category</th>
                  <th className="p-4 font-bold">Details</th>
                  <th className="p-4 font-bold">Payment Mode</th>
                  <th className="p-4 font-bold text-right">Amount</th>
                  <th className="p-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((exp) => (
                  <tr key={exp._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-slate-600 whitespace-nowrap">
                      {new Date(exp.expenseDate).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="p-4 font-bold text-theme-navy">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-rose-500" />
                        {exp.category}
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">
                      <div className="font-medium text-slate-800">{exp.description || '-'}</div>
                      {exp.reference && <div className="text-[10px] text-slate-400 font-mono mt-0.5">Ref: {exp.reference}</div>}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex px-2 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md">
                        {exp.paymentMethod}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-rose-600 text-right text-base">
                      ₹{exp.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDelete(exp._id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredExpenses.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                      No expenses found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-rose-500" /> Record New Expense
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <Search className="w-5 h-5 opacity-0" /> {/* Spacer */}
                <span className="text-xl leading-none">&times;</span>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Expense Category *</label>
                  <select
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-theme-blue focus:ring-2 focus:ring-theme-blue/20 outline-none font-bold text-theme-navy"
                  >
                    {categories.map(c => (
                      <option key={c._id} value={c.name}>{c.name}</option>
                    ))}
                    {categories.length === 0 && <option value="">No categories found</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-base font-bold text-rose-600 focus:border-theme-blue focus:ring-2 focus:ring-theme-blue/20 outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-theme-blue focus:ring-2 focus:ring-theme-blue/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Payment Method *</label>
                  <select
                    required
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:border-theme-blue focus:ring-2 focus:ring-theme-blue/20 outline-none"
                  >
                    <option value="CASH">Cash</option>
                    <option value="CARD">Card</option>
                    <option value="UPI">UPI</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-theme-blue focus:ring-2 focus:ring-theme-blue/20 outline-none"
                  placeholder="What was this expense for?"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Reference / Bill No.</label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-theme-blue focus:ring-2 focus:ring-theme-blue/20 outline-none font-mono"
                  placeholder="e.g. Bill #1234"
                />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={categories.length === 0}
                  className="flex-1 px-4 py-3 rounded-xl bg-theme-teal text-white font-bold text-sm hover:bg-theme-teal/90 transition-colors disabled:opacity-50"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
