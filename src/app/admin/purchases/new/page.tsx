'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, CheckCircle, Save, ShoppingBag, Truck } from 'lucide-react';
import { usePOS } from '../../../../context/POSContext';

interface Supplier {
  _id: string;
  name: string;
}

interface Product {
  id: string;
  _id: string;
  name: string;
  sku: string;
  barcode: string;
  unit: string;
  purchasePrice: number;
}

interface PurchaseItem {
  productId: string;
  name: string;
  sku: string;
  barcode: string;
  unit: string;
  quantity: number;
  purchasePrice: number;
  gst: number;
  discount: number;
  total: number;
}

export default function NewPurchasePage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierId, setSupplierId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  
  const { products, fetchProducts, showToast } = usePOS();
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<PurchaseItem[]>([]);
  
  const [paymentStatus, setPaymentStatus] = useState('PAID');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetch('/api/suppliers')
      .then(res => res.json())
      .then(data => setSuppliers(data.data || []))
      .catch(console.error);
  }, [fetchProducts]);

  const filteredProducts = search.length > 2 
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search))
    : [];

  const addItem = (product: Product) => {
    if (items.find(i => i.productId === product.id)) {
      showToast('Item already in purchase list', 'error');
      return;
    }
    const newItem: PurchaseItem = {
      productId: product.id,
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      unit: product.unit,
      quantity: 1,
      purchasePrice: product.purchasePrice || 0,
      gst: 0,
      discount: 0,
      total: product.purchasePrice || 0,
    };
    setItems([...items, newItem]);
    setSearch('');
  };

  const removeItem = (productId: string) => {
    setItems(items.filter(i => i.productId !== productId));
  };

  const updateItem = (productId: string, field: keyof PurchaseItem, value: number) => {
    setItems(items.map(item => {
      if (item.productId === productId) {
        const updated = { ...item, [field]: value };
        // Recalculate total
        const baseTotal = updated.quantity * updated.purchasePrice;
        const afterDiscount = baseTotal - updated.discount;
        const taxAmount = (afterDiscount * updated.gst) / 100;
        updated.total = afterDiscount + taxAmount;
        return updated;
      }
      return item;
    }));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.purchasePrice), 0);
  const totalDiscount = items.reduce((sum, item) => sum + item.discount, 0);
  const totalTax = items.reduce((sum, item) => {
    const afterDiscount = (item.quantity * item.purchasePrice) - item.discount;
    return sum + ((afterDiscount * item.gst) / 100);
  }, 0);
  const grandTotal = items.reduce((sum, item) => sum + item.total, 0);

  useEffect(() => {
    if (paymentStatus === 'PAID') {
      setAmountPaid(grandTotal);
    } else if (paymentStatus === 'DUE') {
      setAmountPaid(0);
    }
  }, [grandTotal, paymentStatus]);

  const handleSubmit = async () => {
    if (!supplierId || !invoiceNumber) {
      showToast('Supplier and Invoice Number are required', 'error');
      return;
    }
    if (items.length === 0) {
      showToast('Add at least one item', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        supplierId,
        invoiceNumber,
        items,
        subtotal,
        tax: totalTax,
        discount: totalDiscount,
        grandTotal,
        paymentStatus,
        amountPaid,
        amountDue: grandTotal - amountPaid,
      };

      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        showToast('Purchase recorded and stock updated!');
        // Reset form
        setSupplierId('');
        setInvoiceNumber('');
        setItems([]);
        setPaymentStatus('PAID');
        setAmountPaid(0);
      } else {
        showToast(data.error || 'Failed to save purchase', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('An error occurred', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2850]">New Purchase / PO</h1>
          <p className="text-xs text-slate-500 mt-1">Record inward stock from suppliers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Purchase Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-600 mb-2">Supplier *</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-theme-blue/20 outline-none"
              >
                <option value="">Select Supplier...</option>
                {suppliers.map(s => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-600 mb-2">Supplier Invoice No *</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-theme-blue/20 outline-none"
                placeholder="e.g. INV-9988"
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-theme-teal" /> Add Items to PO
            </h3>
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search product by name or barcode to add..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-theme-blue/30 rounded-xl text-sm focus:ring-2 focus:ring-theme-blue/50 outline-none transition-all"
              />
              <Search className="w-4 h-4 text-theme-blue absolute left-3.5 top-1/2 -translate-y-1/2" />
              
              {search.length > 2 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {filteredProducts.map(p => (
                    <button
                      key={p.id}
                      onClick={() => addItem(p)}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-bold text-slate-800">{p.name}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{p.sku}</div>
                      </div>
                      <Plus className="w-4 h-4 text-theme-teal" />
                    </button>
                  ))}
                  {filteredProducts.length === 0 && (
                    <div className="p-4 text-center text-slate-500 text-sm">No products found.</div>
                  )}
                </div>
              )}
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-mono text-[10px] uppercase">
                  <tr>
                    <th className="p-3 font-bold">Product</th>
                    <th className="p-3 font-bold">Qty</th>
                    <th className="p-3 font-bold">Cost (₹)</th>
                    <th className="p-3 font-bold">GST (%)</th>
                    <th className="p-3 font-bold">Total (₹)</th>
                    <th className="p-3 font-bold"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map(item => (
                    <tr key={item.productId} className="hover:bg-slate-50">
                      <td className="p-3">
                        <div className="font-bold text-theme-navy">{item.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{item.sku}</div>
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.productId, 'quantity', parseFloat(e.target.value) || 1)}
                          className="w-20 px-2 py-1 border rounded-lg text-sm"
                        />
                        <span className="text-xs text-slate-500 ml-1">{item.unit}</span>
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          min="0"
                          value={item.purchasePrice}
                          onChange={(e) => updateItem(item.productId, 'purchasePrice', parseFloat(e.target.value) || 0)}
                          className="w-24 px-2 py-1 border rounded-lg text-sm"
                        />
                      </td>
                      <td className="p-3">
                        <select
                          value={item.gst}
                          onChange={(e) => updateItem(item.productId, 'gst', parseFloat(e.target.value) || 0)}
                          className="w-16 px-1 py-1 border rounded-lg text-sm bg-white"
                        >
                          <option value="0">0%</option>
                          <option value="5">5%</option>
                          <option value="12">12%</option>
                          <option value="18">18%</option>
                          <option value="28">28%</option>
                        </select>
                      </td>
                      <td className="p-3 font-bold text-theme-teal">
                        {item.total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right">
                        <button onClick={() => removeItem(item.productId)} className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-10 text-center text-slate-400 font-medium border-2 border-dashed border-slate-100 m-2">
                        Search and add products to this purchase order.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Payment & Summary */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-20 space-y-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Truck className="w-4 h-4 text-theme-orange" />
              Purchase Summary
            </h3>

            <div className="space-y-3 text-sm font-medium">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>Total Discount</span>
                <span>-₹{totalDiscount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Tax (GST)</span>
                <span>+₹{totalTax.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between font-bold text-xl text-theme-navy">
                <span>Grand Total</span>
                <span>₹{grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">Payment Status</label>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  {['PAID', 'PARTIAL', 'DUE'].map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setPaymentStatus(status)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        paymentStatus === status ? 'bg-white shadow-sm text-theme-blue' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {paymentStatus === 'PARTIAL' && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Amount Paid (₹)</label>
                  <input
                    type="number"
                    max={grandTotal}
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-theme-blue/20 outline-none"
                  />
                  <p className="text-xs text-rose-500 mt-1">Due: ₹{(grandTotal - amountPaid).toFixed(2)}</p>
                </div>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || items.length === 0}
              className={`w-full py-3.5 font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 text-sm ${
                isSubmitting || items.length === 0 ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-theme-teal hover:bg-theme-teal/90 text-white'
              }`}
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Saving...' : 'Save Purchase & Update Stock'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
