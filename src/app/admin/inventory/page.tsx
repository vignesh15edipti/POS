'use client';

import React, { useState, useEffect } from 'react';
import { usePOS } from '../../../context/POSContext';
import { Product, Category } from '../../../types/pos';
import Link from 'next/link';
import { 
  Package, Search, Plus, Edit3, Trash2, AlertTriangle, Barcode, CheckCircle2, X, History, ArrowUpRight, PlusCircle 
} from 'lucide-react';

// Categories fetched dynamically

export default function InventoryPage() {
  const { 
    products, 
    isLoadingProducts, 
    fetchProducts, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    adjustStock,
    stockHistoryLogs,
    fetchStockHistory,
    showToast 
  } = usePOS();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [stockFilter, setStockFilter] = useState<string>('ALL');

  // Modals State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Dynamic Categories, SubCategories, Brands, Units
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProductForStock, setSelectedProductForStock] = useState<Product | null>(null);
  const [selectedProductForHistory, setSelectedProductForHistory] = useState<Product | null>(null);

  // Stock Adjustment Form
  const [stockAddAmount, setStockAddAmount] = useState<number>(5);
  const [stockAddType, setStockAddType] = useState<string>('ADJUSTMENT');
  const [stockAddReason, setStockAddReason] = useState<string>('');
  const [stockAddBatchNumber, setStockAddBatchNumber] = useState<string>('');
  const [stockAddExpiryDate, setStockAddExpiryDate] = useState<string>('');

  // Product Add/Edit Form
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    sku: '',
    category: 'Groceries & Staples' as Category,
    unit: 'piece',
    purchasePrice: 10,
    sellingPrice: 15,
    mrp: 18,
    stockQuantity: 10,
    minimumStock: 5,
    imageUrl: '',
    pricePerKg: 0,
    brand: '',
    subcategory: '',
    taxRate: 5,
    expiryTracking: false,
    batchTracking: false
  });
  const [isCustomUnit, setIsCustomUnit] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchStockHistory();
    fetch('/api/categories?active=true')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCategories(data);
        else console.error('Categories API error:', data);
      })
      .catch(console.error);

    fetch('/api/sub-categories?active=true')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSubCategories(data);
        else console.error('Subcategories API error:', data);
      })
      .catch(console.error);

    fetch('/api/brands?active=true')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBrands(data);
        else console.error('Brands API error:', data);
      })
      .catch(console.error);

    fetch('/api/units?active=true')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setUnits(data);
        else console.error('Units API error:', data);
      })
      .catch(console.error);
  }, [fetchProducts, fetchStockHistory]);

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    const randomSku = `SKU-${Math.floor(1000 + Math.random() * 9000)}`;
    const randomBarcode = `890${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    setFormData({
      name: '',
      barcode: randomBarcode,
      sku: randomSku,
      category: 'Groceries & Staples',
      unit: 'piece',
      purchasePrice: 10,
      sellingPrice: 15,
      mrp: 18,
      stockQuantity: 10,
      minimumStock: 5,
      imageUrl: '',
      pricePerKg: 0,
      brand: '',
      subcategory: '',
      taxRate: 5,
      expiryTracking: false,
      batchTracking: false
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      barcode: p.barcode,
      sku: p.sku,
      category: p.category,
      unit: p.unit || 'piece',
      purchasePrice: p.purchasePrice,
      sellingPrice: p.sellingPrice,
      mrp: p.mrp,
      stockQuantity: p.stockQuantity,
      minimumStock: p.minimumStock,
      imageUrl: p.imageUrl || '',
      pricePerKg: p.pricePerKg || 0,
      brand: (p as any).brand || '',
      subcategory: (p as any).subcategory || '',
      taxRate: p.taxRate || 5,
      expiryTracking: (p as any).expiryTracking || false,
      batchTracking: (p as any).batchTracking || false
    });
    setIsCustomUnit(false);
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isContinuous = units.find(u => u.shortCode === formData.unit)?.allowDecimal || ['KG', 'GRAM', 'LITRE', 'ML'].includes(formData.unit);
    const effectiveSellingPrice = isContinuous ? formData.pricePerKg : formData.sellingPrice;
    const effectiveMrp = isContinuous ? formData.pricePerKg : formData.mrp;

    if (editingProduct) {
      await updateProduct(editingProduct.id, {
        name: formData.name,
        barcode: formData.barcode,
        sku: formData.sku,
        category: formData.category,
        subcategory: formData.subcategory,
        brand: formData.brand,
        unit: formData.unit as any,
        purchasePrice: formData.purchasePrice,
        sellingPrice: effectiveSellingPrice,
        pricePerKg: formData.pricePerKg,
        mrp: effectiveMrp,
        taxRate: formData.taxRate,
        stockQuantity: formData.stockQuantity,
        minimumStock: formData.minimumStock,
        expiryTracking: formData.expiryTracking,
        batchTracking: formData.batchTracking
      });
    } else {
      await addProduct({
        name: formData.name,
        barcode: formData.barcode,
        sku: formData.sku,
        category: formData.category,
        subcategory: formData.subcategory,
        brand: formData.brand,
        unit: formData.unit as any,
        purchasePrice: formData.purchasePrice,
        sellingPrice: effectiveSellingPrice,
        pricePerKg: formData.pricePerKg,
        mrp: effectiveMrp,
        taxRate: formData.taxRate,
        
        stockQuantity: formData.stockQuantity,
        minimumStock: formData.minimumStock,
        imageUrl: formData.imageUrl,
        isActive: true,
        expiryTracking: formData.expiryTracking,
        batchTracking: formData.batchTracking
      });
    }
    setIsProductModalOpen(false);
  };

  const handleOpenAddStockModal = (p: Product) => {
    setSelectedProductForStock(p);
    setStockAddAmount(5);
    setStockAddType('ADJUSTMENT');
    setStockAddReason('');
    setStockAddBatchNumber('');
    setStockAddExpiryDate('');
    setIsStockModalOpen(true);
  };

  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProductForStock) {
      // Basic validation for batch
      if (selectedProductForStock.batchTracking && (!stockAddBatchNumber || !stockAddExpiryDate)) {
        showToast('⚠️ Batch Number and Expiry Date are required for this product.');
        return;
      }
      await adjustStock(selectedProductForStock.id, stockAddType, stockAddAmount, stockAddReason, stockAddBatchNumber, stockAddExpiryDate);
      setIsStockModalOpen(false);
    }
  };

  const handleOpenHistoryModal = (p?: Product) => {
    setSelectedProductForHistory(p || null);
    setIsHistoryModalOpen(true);
  };

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.barcode.includes(search) ||
                        p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'ALL' || p.category === categoryFilter;
    const matchStock = 
      stockFilter === 'ALL' ||
      (stockFilter === 'LOW' && p.stockQuantity <= p.minimumStock && p.stockQuantity > 0) ||
      (stockFilter === 'OUT' && p.stockQuantity === 0);
    return matchSearch && matchCat && matchStock;
  });

  const filteredHistory = selectedProductForHistory 
    ? stockHistoryLogs.filter(h => h.sku === selectedProductForHistory.sku || h.productId === selectedProductForHistory.id)
    : stockHistoryLogs;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-theme-white p-5 rounded-2xl border border-theme-gray-border shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2850] tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-theme-blue" />
            Master Inventory Catalog
          </h1>
          <p className="text-xs text-theme-gray-text font-mono mt-0.5">
            Live database collection. Duplicate SKU rule enforced (increments stock automatically).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleOpenHistoryModal()}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-theme-gray-light hover:bg-slate-200 text-theme-navy font-mono font-bold rounded-xl text-xs border border-theme-gray-border transition-colors"
          >
            <History className="w-4 h-4 text-theme-blue" />
            <span>Stock History Logs</span>
          </button>

          <Link
            href="/admin/inventory/expiries"
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs border border-rose-200 transition-colors shrink-0"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Expiry Dashboard</span>
          </Link>

          <button
            onClick={handleOpenAddProduct}
            className="flex items-center gap-2 px-4 py-2.5 bg-theme-blue hover:bg-theme-blue text-white font-bold rounded-xl text-xs shadow-sm transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add / Import Product</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-theme-white p-4 rounded-2xl border border-theme-gray-border shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search product name, SKU, or Barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-theme-gray-light border border-theme-gray-border rounded-xl text-xs font-mono"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto font-mono text-xs">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-theme-gray-light border border-theme-gray-border rounded-xl font-bold text-theme-navy"
          >
            <option value="ALL">All Categories</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-3 py-2 bg-theme-gray-light border border-theme-gray-border rounded-xl font-bold text-theme-navy"
          >
            <option value="ALL">All Stock Status</option>
            <option value="LOW">Low Stock Only</option>
            <option value="OUT">Out of Stock Only</option>
          </select>
        </div>
      </div>

      {/* Inventory Table connected to MongoDB */}
      <div className="bg-theme-white rounded-2xl border border-theme-gray-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-theme-gray-light text-theme-gray-text text-[10px] uppercase border-b border-theme-gray-border">
                <th className="p-3">Product Name & SKU</th>
                <th className="p-3">Barcode</th>
                <th className="p-3">Category</th>
                <th className="p-3 text-right">Purchase</th>
                <th className="p-3 text-right">Selling</th>
                <th className="p-3 text-center">Stock Level</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoadingProducts ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Loading live products...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No products found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const isLow = p.stockQuantity <= p.minimumStock;
                  const isOut = p.stockQuantity === 0;

                  return (
                    <tr key={p.id} className="hover:bg-theme-gray-light/80">
                      <td className="p-3">
                        <div className="font-bold text-theme-navy font-sans">{p.name}</div>
                        <div className="text-[10px] text-theme-blue font-bold">SKU: {p.sku}</div>
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-1 text-theme-navy">
                          <Barcode className="w-3.5 h-3.5 text-slate-400" />
                          <span>{p.barcode}</span>
                        </div>
                      </td>

                      <td className="p-3">
                        <span className="bg-theme-gray-light text-theme-navy px-2 py-0.5 rounded text-[10px] font-semibold">
                          {categories.find(c => c._id === p.category)?.name || p.category}
                        </span>
                      </td>

                      <td className="p-3 text-right text-theme-gray-text">
                        ₹{p.purchasePrice.toFixed(2)}
                      </td>

                      <td className="p-3 text-right font-bold text-theme-navy">
                        ₹{p.sellingPrice.toFixed(2)}
                      </td>

                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded font-bold text-xs inline-flex items-center gap-1 ${
                          isOut
                            ? 'bg-rose-100 text-rose-800'
                            : isLow
                            ? 'bg-theme-orange-light text-amber-800'
                            : 'bg-theme-teal/20 text-emerald-800'
                        }`}>
                          {p.stockQuantity} {units.find(u => u._id === p.unit)?.shortCode || p.unit || 'piece'}
                          {isOut && ' (OUT)'}
                          {isLow && !isOut && ' (LOW)'}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenAddStockModal(p)}
                            className="px-2.5 py-1 bg-theme-teal hover:bg-theme-teal text-white font-bold rounded text-[10px] shadow-2xs flex items-center gap-1"
                            title="Add stock to MongoDB"
                          >
                            <Plus className="w-3 h-3" />
                            <span>+ Stock</span>
                          </button>
                          <button
                            onClick={() => handleOpenHistoryModal(p)}
                            className="p-1.5 text-theme-gray-text hover:text-theme-blue hover:bg-blue-50 rounded"
                            title="View Stock History Logs"
                          >
                            <History className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditProduct(p)}
                            className="p-1.5 text-theme-gray-text hover:text-theme-blue hover:bg-blue-50 rounded"
                            title="Edit Product Details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteProduct(p.id)}
                            className="p-1.5 text-theme-gray-text hover:text-rose-600 hover:bg-rose-50 rounded"
                            title="Delete / Disable Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal (Duplicate SKU Rule Enforced) */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-theme-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
            <div className="bg-theme-navy text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-base">
                  {editingProduct ? 'Edit Product Details' : 'Add Product to MongoDB'}
                </h2>
                <p className="text-[10px] text-theme-orange font-mono">
                  If SKU already exists, quantity will be added to existing product!
                </p>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="w-8 h-8 rounded-full bg-theme-white/10 hover:bg-theme-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="p-5 space-y-3.5 text-xs font-mono max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-theme-navy font-bold mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Britannia Marie Gold"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-theme-navy font-bold mb-1">SKU (Unique Identifier)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MARIE001"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl uppercase font-bold text-theme-blue"
                  />
                </div>
                <div>
                  <label className="block text-theme-navy font-bold mb-1">Barcode / QR Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 8901234567890"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-theme-navy font-bold mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="">Select Category...</option>
                    {categories.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-theme-navy font-bold mb-1">Brand</label>
                  <select
                    value={formData.brand || ''}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="">Select Brand...</option>
                    {brands.map(b => (
                      <option key={b._id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-theme-navy font-bold mb-1">Subcategory</label>
                  <select
                    value={formData.subcategory || ''}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  >
                    <option value="">Select Subcategory...</option>
                    {subCategories.filter(s => !formData.category || s.parentCategory === formData.category).map(s => (
                      <option key={s._id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-theme-navy font-bold mb-1">Unit</label>
                  {isCustomUnit ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl"
                        placeholder="Type custom unit..."
                        autoFocus
                      />
                      <button type="button" onClick={() => setIsCustomUnit(false)} className="px-3 py-2 bg-theme-gray-light border rounded-xl font-bold text-xs hover:bg-slate-200">
                        Back
                      </button>
                    </div>
                  ) : (
                    <select
                      value={formData.unit}
                      onChange={(e) => {
                        if (e.target.value === 'CUSTOM') {
                          setIsCustomUnit(true);
                          setFormData({ ...formData, unit: '' });
                        } else {
                          setFormData({ ...formData, unit: e.target.value });
                        }
                      }}
                      className="w-full px-3 py-2 border rounded-xl"
                    >
                      <option value="">Select Unit...</option>
                      <option value="piece">piece</option>
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="litre">litre</option>
                      <option value="ml">ml</option>
                      <option value="packet">packet</option>
                      {units.length > 0 && <option disabled>──────</option>}
                      {units.map(u => (
                        <option key={u._id} value={u._id}>{u.shortCode} ({u.name})</option>
                      ))}
                      <option disabled>──────</option>
                      <option value="CUSTOM">+ Add Custom Unit</option>
                    </select>
                  )}
                </div>
              </div>

              {!(units.find(u => u.shortCode === formData.unit)?.allowDecimal || ['KG', 'GRAM', 'LITRE', 'ML'].includes(formData.unit)) && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-theme-navy font-bold mb-1">Purchase Price (₹)</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-theme-navy font-bold mb-1">Selling Price (₹)</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={formData.sellingPrice}
                      onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border rounded-xl font-bold text-theme-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-theme-navy font-bold mb-1">MRP (₹)</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={formData.mrp}
                      onChange={(e) => setFormData({ ...formData, mrp: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>
                </div>
              )}

              {(units.find(u => u.shortCode === formData.unit)?.allowDecimal || ['KG', 'GRAM', 'LITRE', 'ML'].includes(formData.unit)) && (
                <div>
                  <label className="block text-theme-navy font-bold mb-1">Price per {formData.unit.toUpperCase()} (₹)</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={formData.pricePerKg}
                    onChange={(e) => setFormData({ ...formData, pricePerKg: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-xl font-bold text-theme-orange"
                  />
                  <p className="text-[10px] text-theme-gray-text mt-1">If set, this will be used to calculate weight/volume-based amounts dynamically at POS.</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-theme-navy font-bold mb-1">Current Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-xl font-bold text-theme-navy"
                  />
                </div>
                <div>
                  <label className="block text-theme-navy font-bold mb-1">Reorder Threshold</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minimumStock}
                    onChange={(e) => setFormData({ ...formData, minimumStock: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-bold text-theme-gray-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-theme-blue hover:bg-theme-blue text-white font-bold rounded-xl shadow-xs"
                >
                  {editingProduct ? 'Update Product' : 'Save / Add Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Addition Modal */}
      {isStockModalOpen && selectedProductForStock && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-theme-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-theme-navy text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-base">Add Stock: {selectedProductForStock.name}</h2>
                <p className="text-[10px] text-slate-300 font-mono">SKU: {selectedProductForStock.sku}</p>
              </div>
              <button
                onClick={() => setIsStockModalOpen(false)}
                className="w-8 h-8 rounded-full bg-theme-white/10 hover:bg-theme-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleStockSubmit} className="p-5 space-y-4 text-xs font-mono">
              <div className="p-3 bg-theme-gray-light rounded-xl border border-theme-gray-border flex justify-between">
                <span>Current Stock:</span>
                <span className="font-bold text-theme-navy">{selectedProductForStock.stockQuantity} {selectedProductForStock.unit}</span>
              </div>

              <div>
                <label className="block text-theme-navy font-bold mb-1">Adjustment Type</label>
                <select value={stockAddType} onChange={(e) => setStockAddType(e.target.value)} className="w-full px-3 py-2 border rounded-xl mb-3 font-bold text-theme-navy border-theme-gray-border">
                  <option value="ADJUSTMENT">Manual Adjustment</option>
                  <option value="PHYSICAL_COUNT">Physical Count</option>
                  <option value="DAMAGE">Damage</option>
                  <option value="WASTAGE">Wastage</option>
                  <option value="EXPIRY">Expiry</option>
                </select>
                <label className="block text-theme-navy font-bold mb-1">Quantity</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={stockAddAmount}
                  onChange={(e) => setStockAddAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 border-2 border-theme-teal rounded-xl font-bold text-lg text-theme-navy"
                />
              </div>

              <div>
                <label className="block text-theme-navy font-bold mb-1">Reason / Note</label>
                <input
                  type="text"
                  value={stockAddReason}
                  onChange={(e) => setStockAddReason(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                  placeholder="e.g. Shipment received"
                />
              </div>

              {selectedProductForStock?.batchTracking && (
                <div className="grid grid-cols-2 gap-3 bg-theme-orange-light p-3 rounded-xl border border-theme-orange/30">
                  <div>
                    <label className="block text-theme-navy font-bold mb-1">Batch Number *</label>
                    <input
                      type="text"
                      required
                      value={stockAddBatchNumber}
                      onChange={(e) => setStockAddBatchNumber(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl border-theme-orange/50"
                      placeholder="e.g. BATCH-001"
                    />
                  </div>
                  <div>
                    <label className="block text-theme-navy font-bold mb-1">Expiry Date *</label>
                    <input
                      type="date"
                      required
                      value={stockAddExpiryDate}
                      onChange={(e) => setStockAddExpiryDate(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl border-theme-orange/50"
                    />
                  </div>
                </div>
              )}

              <div className="p-3 bg-emerald-50 border border-theme-teal rounded-xl flex justify-between font-bold text-emerald-800">
                <span>New Total Stock:</span>
                <span>{selectedProductForStock.stockQuantity + stockAddAmount} {selectedProductForStock.unit}</span>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsStockModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-theme-teal hover:bg-theme-teal text-white font-bold rounded-xl shadow-xs"
                >
                  Save Stock Addition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock History Timeline Modal */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-theme-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-theme-navy text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-base flex items-center gap-2">
                  <History className="w-5 h-5 text-theme-blue" />
                  Stock Movement History Logs
                </h2>
                <p className="text-[10px] text-slate-300 font-mono">
                  {selectedProductForHistory ? `Filter: ${selectedProductForHistory.name} (${selectedProductForHistory.sku})` : 'All Inventory Logs'}
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
              {filteredHistory.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  No stock history logs recorded yet.
                </div>
              ) : (
                filteredHistory.map((log) => (
                  <div key={log._id} className="py-3 flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                          log.type === 'SALE'
                            ? 'bg-rose-100 text-rose-800'
                            : log.type === 'ADD_STOCK'
                            ? 'bg-theme-teal/20 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {log.type}
                        </span>
                        <span className="font-bold text-theme-navy font-sans">{log.productName}</span>
                        <span className="text-slate-400 text-[10px]">({log.sku})</span>
                        {log.batchNumber && (
                          <span className="bg-theme-orange-light border border-theme-orange/30 text-amber-900 text-[10px] px-1.5 rounded">
                            Batch: {log.batchNumber} | Exp: {log.expiryDate ? new Date(log.expiryDate).toLocaleDateString() : 'N/A'}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-theme-gray-text mt-1">{log.reason || 'Inventory movement'}</p>
                      <span className="text-[10px] text-slate-400">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>

                    <div className="text-right">
                      <span className={`font-bold text-sm block ${log.qtyChanged > 0 ? 'text-theme-teal' : 'text-rose-600'}`}>
                        {log.qtyChanged > 0 ? '+' : ''}{log.qtyChanged}
                      </span>
                      <span className="text-[10px] text-theme-gray-text">Resulting: {log.resultingQty}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-theme-gray-light border-t text-right">
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-4 py-1.5 bg-slate-200 text-theme-navy font-bold rounded-lg text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
