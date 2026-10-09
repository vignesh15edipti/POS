'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';

interface Subcategory {
  _id?: string;
  name: string;
  isActive: boolean;
}

interface Category {
  _id: string;
  name: string;
  subcategories: Subcategory[];
  isActive: boolean;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [newSubcatName, setNewSubcatName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
    setIsLoading(false);
  };

  const handleOpenModal = (cat?: Category) => {
    if (cat) {
      setEditingId(cat._id);
      setName(cat.name);
      setIsActive(cat.isActive);
      setSubcategories(cat.subcategories || []);
    } else {
      setEditingId(null);
      setName('');
      setIsActive(true);
      setSubcategories([]);
    }
    setNewSubcatName('');
    setIsModalOpen(true);
  };

  const handleAddSubcategory = () => {
    if (!newSubcatName.trim()) return;
    setSubcategories([...subcategories, { name: newSubcatName.trim(), isActive: true }]);
    setNewSubcatName('');
  };

  const handleRemoveSubcategory = (index: number) => {
    setSubcategories(subcategories.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    const payload = { name, isActive, subcategories };

    try {
      if (editingId) {
        await fetch(`/api/categories/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Save failed', error);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2850]">Categories Master</h1>
          <p className="text-xs text-slate-500 mt-1">Manage dynamic product categories & subcategories</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-theme-teal hover:bg-theme-teal/90 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-slate-400">Loading categories...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-mono text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="p-4 font-bold">Category Name</th>
                <th className="p-4 font-bold">Subcategories</th>
                <th className="p-4 font-bold text-center">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-800">{c.name}</td>
                  <td className="p-4 text-slate-600">
                    <div className="flex flex-wrap gap-2">
                      {c.subcategories?.map((s, i) => (
                        <span key={i} className="bg-slate-100 px-2 py-0.5 rounded text-xs border border-slate-200">
                          {s.name} {s.isActive ? '' : '(Inactive)'}
                        </span>
                      ))}
                      {(!c.subcategories || c.subcategories.length === 0) && <span className="text-xs text-slate-400">None</span>}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    {c.isActive ? (
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
                    <button
                      onClick={() => handleOpenModal(c)}
                      className="p-1.5 text-theme-blue hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">{editingId ? 'Edit Category' : 'New Category'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Category Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold"
                  placeholder="e.g. Fresh Vegetables"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Status</label>
                <select
                  value={isActive ? 'true' : 'false'}
                  onChange={(e) => setIsActive(e.target.value === 'true')}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold bg-white"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <label className="block text-xs font-bold text-slate-500 mb-2">Subcategories</label>
                
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newSubcatName}
                    onChange={(e) => setNewSubcatName(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                    placeholder="Add subcategory..."
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSubcategory()}
                  />
                  <button
                    onClick={handleAddSubcategory}
                    className="bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {subcategories.map((sub, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg text-sm border border-slate-100">
                      <span className="font-medium text-slate-700">{sub.name}</span>
                      <button onClick={() => handleRemoveSubcategory(idx)} className="text-rose-500 hover:bg-rose-50 p-1 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {subcategories.length === 0 && <p className="text-xs text-slate-400 italic">No subcategories added.</p>}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-bold text-white bg-theme-teal hover:bg-theme-teal/90 rounded-xl transition-colors"
              >
                Save Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
