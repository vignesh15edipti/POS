'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';

interface SubCategory {
  _id: string;
  name: string;
  parentCategory: string;
  description: string;
  isActive: boolean;
}

export default function SubCategoriesPage() {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [parentCategory, setParentCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchSubCategories();
    fetchCategories();
  }, []);

  const fetchSubCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/sub-categories');
      if (res.ok) {
        const data = await res.json();
        setSubCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch sub-categories', error);
    }
    setIsLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories?active=true');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  };

  const handleOpenModal = (subCat?: SubCategory) => {
    if (subCat) {
      setEditingId(subCat._id);
      setName(subCat.name);
      setParentCategory(subCat.parentCategory);
      setDescription(subCat.description || '');
      setIsActive(subCat.isActive);
    } else {
      setEditingId(null);
      setName('');
      setParentCategory('');
      setDescription('');
      setIsActive(true);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !parentCategory.trim()) return;

    const payload = { name, parentCategory, description, isActive };

    try {
      if (editingId) {
        await fetch(`/api/sub-categories/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/sub-categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      setIsModalOpen(false);
      fetchSubCategories();
    } catch (error) {
      console.error('Save failed', error);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2850]">Sub Categories</h1>
          <p className="text-xs text-slate-500 mt-1">Manage product sub-categories</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-theme-teal hover:bg-theme-teal/90 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Sub Category
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-slate-400">Loading...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-mono text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="p-4 font-bold">Sub Category Name</th>
                <th className="p-4 font-bold">Parent Category</th>
                <th className="p-4 font-bold text-center">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subCategories.map((s) => (
                <tr key={s._id} className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-800">{s.name}</td>
                  <td className="p-4 text-slate-600">{s.parentCategory}</td>
                  <td className="p-4 text-center">
                    {s.isActive ? (
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
                    <button onClick={() => handleOpenModal(s)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg mr-2 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {subCategories.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400 font-medium">
                    No sub-categories found. Create your first one!
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
                {editingId ? 'Edit Sub Category' : 'New Sub Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Sub Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:border-theme-blue focus:ring-2 focus:ring-theme-blue/20 outline-none"
                  placeholder="e.g. Leafy Vegetables"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Parent Category *</label>
                <select
                  required
                  value={parentCategory}
                  onChange={(e) => setParentCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:border-theme-blue focus:ring-2 focus:ring-theme-blue/20 outline-none"
                >
                  <option value="">Select Parent Category...</option>
                  {categories.map(c => (
                    <option key={c._id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:border-theme-blue focus:ring-2 focus:ring-theme-blue/20 outline-none resize-none h-20"
                  placeholder="Optional description"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-theme-teal focus:ring-theme-teal"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Active Status</label>
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
                  Save Sub Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
