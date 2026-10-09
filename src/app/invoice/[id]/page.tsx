'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Printer, ArrowLeft, Store, ShieldCheck } from 'lucide-react';

interface InvoiceData {
  _id: string;
  invoiceNumber: string;
  createdAt: string;
  customerName?: string;
  customerMobile?: string;
  cashierName?: string;
  items: any[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  paymentMethod: string;
  amountReceived: number;
  change: number;
}

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/sales/${params.id}`)
        .then(res => res.json())
        .then(json => {
          if (json.success) {
            setInvoice(json.data);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [params.id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-mono text-sm">Loading Invoice...</div>;
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <h1 className="text-xl font-bold text-rose-600">Invoice Not Found</h1>
        <button onClick={() => router.back()} className="px-4 py-2 bg-theme-blue text-white rounded-lg">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans print:bg-white print:p-0">
      
      {/* Non-printable Action Bar */}
      <div className="max-w-2xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 px-6 py-2 bg-theme-blue text-white rounded-lg text-sm font-bold hover:bg-theme-navy transition-colors shadow-sm"
        >
          <Printer className="w-4 h-4" /> Print Invoice
        </button>
      </div>

      {/* Invoice Container (A4 / Thermal hybrid friendly width) */}
      <div className="max-w-2xl mx-auto bg-white p-6 md:p-10 rounded-xl shadow-md print:shadow-none print:rounded-none border border-slate-200">
        
        {/* Header */}
        <div className="flex flex-col items-center justify-center border-b-2 border-slate-900 pb-6 mb-6">
          <div className="w-12 h-12 bg-theme-blue text-white rounded-xl flex items-center justify-center mb-3">
            <Store className="w-7 h-7" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">TN FRESHKART GREEN</h1>
          <p className="text-sm text-theme-orange font-bold uppercase tracking-widest mt-1">Smart Grocery Shop</p>
          <p className="text-xs text-slate-500 font-mono mt-2 text-center max-w-xs">
            123 Main Street, Retail Hub<br/>
            GSTIN: 33AABBC1234D1Z5
          </p>
        </div>

        {/* Meta Details */}
        <div className="grid grid-cols-2 gap-4 mb-6 font-mono text-xs">
          <div>
            <p className="text-slate-500 mb-0.5">Invoice Number</p>
            <p className="font-bold text-slate-900 text-sm">{invoice.invoiceNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-500 mb-0.5">Date & Time</p>
            <p className="font-bold text-slate-900 text-sm">{new Date(invoice.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-0.5">Customer Name</p>
            <p className="font-bold text-slate-900">{invoice.customerName || 'Walk-in Customer'}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-500 mb-0.5">Customer Mobile</p>
            <p className="font-bold text-slate-900">{invoice.customerMobile || 'N/A'}</p>
          </div>
        </div>

        {/* Line Items */}
        <div className="mb-6 border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Item Description</th>
                <th className="py-2.5 px-3 text-right">Qty</th>
                <th className="py-2.5 px-3 text-right">Rate</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-slate-900 text-sm">{item.productName || item.name}</div>
                    <div className="text-[10px] text-slate-500 uppercase">{item.sku}</div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold">{item.quantity} {item.unit}</td>
                  <td className="py-2.5 px-3 text-right">₹{(item.sellingPriceAtSale || item.price).toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">₹{item.lineTotal || item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex flex-col items-end space-y-2 mb-8 font-mono text-sm border-b-2 border-slate-900 pb-6">
          <div className="flex justify-between w-full max-w-[250px]">
            <span className="text-slate-600">Subtotal:</span>
            <span className="font-bold text-slate-900">₹{invoice.subtotal.toFixed(2)}</span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between w-full max-w-[250px]">
              <span className="text-theme-orange">Discount / Points:</span>
              <span className="font-bold text-theme-orange">-₹{invoice.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between w-full max-w-[250px]">
            <span className="text-slate-600">Tax Total:</span>
            <span className="font-bold text-slate-900">₹{invoice.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between w-full max-w-[250px] pt-3 border-t border-slate-200 mt-2">
            <span className="font-bold text-slate-900 text-base">GRAND TOTAL:</span>
            <span className="font-black text-emerald-700 text-xl tracking-tight">₹{invoice.grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Meta */}
        <div className="grid grid-cols-2 gap-4 text-xs font-mono mb-8 bg-slate-50 p-4 rounded-lg">
          <div>
            <span className="text-slate-500 block mb-1">Payment Method:</span>
            <span className="font-bold text-slate-900 flex items-center gap-1.5 text-sm uppercase">
              <ShieldCheck className="w-4 h-4 text-theme-teal" />
              {invoice.paymentMethod}
            </span>
          </div>
          {invoice.paymentMethod === 'CASH' && (
            <div className="text-right">
              <span className="text-slate-500 block mb-1">Cash Rendered / Change:</span>
              <span className="font-bold text-slate-900 block">₹{invoice.amountReceived?.toFixed(2)} / ₹{invoice.change?.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center font-mono text-xs text-slate-500 space-y-1">
          <p className="font-bold text-slate-700 text-sm">Thank you for shopping with us!</p>
          <p>Please keep this receipt for returns/exchanges within 3 days.</p>
          <p className="mt-4 pt-4 border-t border-slate-200 text-[10px]">Cashier: {invoice.cashierName || 'Admin'}</p>
        </div>

      </div>
    </div>
  );
}
