'use client';

import React from 'react';
import { usePOS } from '../../context/POSContext';
import { Printer, X, Check, ShoppingBag, Sparkles } from 'lucide-react';

export const ThermalReceiptModal: React.FC = () => {
  const { receiptOrder, setReceiptOrder } = usePOS();

  if (!receiptOrder) return null;

  const handlePrint = () => {
    window.print();
  };

  // Auto-print disabled as per user request to show preview first

  const handleClose = () => {
    setReceiptOrder(null);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-theme-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="bg-theme-navy text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-theme-teal" />
            <span className="font-bold text-base">80mm Thermal Receipt</span>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-theme-white/10 hover:bg-theme-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Receipt Scrollable Body */}
        <div className="p-6 overflow-y-auto font-mono text-xs text-theme-navy space-y-4 bg-theme-gray-light">
          <div id="thermal-receipt-printable" className="bg-theme-white p-6 rounded-xl border border-theme-gray-border shadow-xs space-y-3">
            {/* Store Banner */}
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-theme-gray-border">
              <h2 className="font-bold text-sm tracking-tight text-theme-navy">TN FRESHKART GREEN</h2>
              <p className="text-[10px] text-theme-gray-text">Smart Grocery POS</p>
              <p className="text-[10px] text-theme-gray-text">GSTIN: 27AAACM8912P1Z4 | Ph: 022-28491000</p>
              <div className="mt-2 inline-block bg-slate-900 text-white text-[10px] font-bold px-3 py-0.5 rounded">
                TAX INVOICE
              </div>
            </div>

            {/* Bill Details */}
            <div className="grid grid-cols-2 gap-1 text-[11px] py-1 border-b border-dashed border-theme-gray-border text-theme-navy">
              <div>Bill No: <span className="font-bold text-theme-navy">{receiptOrder.billNumber}</span></div>
              <div className="text-right">Date: {new Date(receiptOrder.createdAt).toLocaleDateString()}</div>
              <div>Cashier: {receiptOrder.employeeName || 'Admin'}</div>
              <div className="col-span-2 mt-1 pt-1 border-t border-slate-100">
                Customer: <span className="font-bold text-theme-navy">{receiptOrder.customerName} ({receiptOrder.customerMobile})</span>
              </div>
            </div>

            {/* Item Table */}
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="border-b border-slate-900 text-theme-navy font-bold uppercase text-[10px]">
                  <th className="py-1">Item</th>
                  <th className="py-1 text-center">Qty</th>
                  <th className="py-1 text-right">Rate</th>
                  <th className="py-1 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {receiptOrder.items.map((item, idx) => (
                  <tr key={idx} className="py-1">
                    <td className="py-1 pr-1 max-w-[140px]">
                      <div className="font-bold text-theme-navy truncate">{item.product.name}</div>
                      <div className="text-[9px] text-theme-gray-text">GST:{item.product.taxRate}%</div>
                    </td>
                    <td className="py-1 text-center font-bold">{item.quantity}</td>
                    <td className="py-1 text-right">₹{item.unitPrice.toFixed(2)}</td>
                    <td className="py-1 text-right font-bold">₹{item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Subtotal & Tax Breakdown */}
            <div className="pt-2 border-t border-dashed border-theme-gray-border space-y-1 text-[11px]">
              <div className="flex justify-between text-theme-gray-text">
                <span>Subtotal ({receiptOrder.items.length} items):</span>
                <span>₹{receiptOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-theme-gray-text">
                <span>CGST (2.5%):</span>
                <span>₹{(receiptOrder.taxTotal / 2).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-theme-gray-text">
                <span>SGST (2.5%):</span>
                <span>₹{(receiptOrder.taxTotal / 2).toFixed(2)}</span>
              </div>
              {receiptOrder.discountTotal > 0 && (
                <div className="flex justify-between text-theme-orange font-bold">
                  <span>Special Discount:</span>
                  <span>-₹{receiptOrder.discountTotal.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Total Savings Banner */}
            {receiptOrder.totalSavings > 0 && (
              <div className="bg-emerald-50 border border-theme-teal p-2 rounded-lg text-center text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-theme-teal" />
                <span>YOU SAVED ₹{receiptOrder.totalSavings.toFixed(2)} TODAY!</span>
              </div>
            )}

            {/* Grand Total */}
            <div className="pt-2 border-t-2 border-slate-900 flex justify-between items-baseline">
              <span className="font-bold text-sm text-theme-navy">NET PAYABLE:</span>
              <span className="font-bold text-xl text-theme-teal font-mono">
                ₹{receiptOrder.grandTotal.toFixed(2)}
              </span>
            </div>

            {/* Payment Info */}
            <div className="bg-theme-gray-light p-2.5 rounded-lg text-[10px] space-y-1 text-theme-navy">
              {receiptOrder.payments.map((p, i) => (
                <div key={i} className="flex justify-between font-bold">
                  <span>Paid via {p.method}:</span>
                  <span>₹{p.amount.toFixed(2)}</span>
                </div>
              ))}
              {receiptOrder.payments[0]?.tendered && (
                <>
                  <div className="flex justify-between">
                    <span>Cash Tendered:</span>
                    <span>₹{receiptOrder.payments[0].tendered.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-theme-teal">
                    <span>Change Returned:</span>
                    <span>₹{(receiptOrder.payments[0].changeReturned || 0).toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Barcode & Footer */}
            <div className="text-center pt-3 space-y-1 border-t border-dashed border-theme-gray-border">
              <div className="inline-block bg-slate-900 text-white px-6 py-1.5 font-mono text-[10px] tracking-widest rounded">
                ||||| | ||||| || |||||| |||
              </div>
              <p className="text-[10px] text-theme-gray-text font-sans mt-1">Visit again! Returns valid for 7 days with bill.</p>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="p-4 bg-theme-white border-t border-theme-gray-border flex items-center justify-between gap-3">
          <button
            onClick={handleClose}
            className="flex-1 py-2.5 border border-theme-gray-border hover:bg-theme-gray-light text-theme-navy font-bold rounded-xl text-xs transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 bg-theme-teal hover:bg-theme-teal text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
