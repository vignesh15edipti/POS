'use client';

import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { PaymentMethod, PaymentDetails } from '../../types/pos';
import { thermalPrinter } from '../../lib/printer';
import { 
  X, Banknote, QrCode, CreditCard, ArrowRight, ShieldCheck, Printer
} from 'lucide-react';

interface PaymentModalProps {
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ onClose }) => {
  const { cart, selectedCustomer, setSelectedCustomer, processCheckout, holdCurrentBill } = usePOS();
  
  // States
  const [method, setMethod] = useState<PaymentMethod>('CASH');
  const [isProcessing, setIsProcessing] = useState(false);
  const [redeemPoints, setRedeemPoints] = useState(false);

  // Order summary calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const taxTotal = cart.reduce((acc, item) => acc + item.taxAmount, 0);
  const discountTotal = cart.reduce((acc, item) => {
    const regularSub = item.quantity * item.unitPrice;
    return acc + (regularSub - item.subtotal);
  }, 0);
  const rawGrandTotal = Math.round(subtotal - discountTotal + taxTotal);
  
  const maxRedeemablePoints = selectedCustomer ? Math.min(selectedCustomer.points, rawGrandTotal) : 0;
  const pointsRedeemed = redeemPoints ? maxRedeemablePoints : 0;
  const grandTotal = Math.max(0, rawGrandTotal - pointsRedeemed);

  // Cash state
  const [tendered, setTendered] = useState<number | ''>('');
  const numericTendered = typeof tendered === 'number' ? tendered : 0;
  const changeReturned = Math.max(0, numericTendered - grandTotal);

  // Card state
  const [cardRef, setCardRef] = useState<string>('');

  const handlePay = async () => {
    setIsProcessing(true);
    let payments: PaymentDetails[] = [];

    if (method === 'CASH') {
      payments = [{
        method: 'CASH',
        amount: grandTotal,
        tendered: numericTendered,
        changeReturned
      }];
    } else if (method === 'UPI') {
      payments = [{
        method: 'UPI',
        amount: grandTotal,
        referenceId: `UPI-${Math.floor(10000000 + Math.random() * 90000000)}`
      }];
    } else if (method === 'CARD') {
      payments = [{
        method: 'CARD',
        amount: grandTotal,
        referenceId: cardRef || `CARD-${Math.floor(1000 + Math.random() * 9000)}`
      }];
    } else if (method === 'CREDIT') {
      payments = [{
        method: 'CREDIT',
        amount: grandTotal
      }];
    }

    const order = await processCheckout(payments, pointsRedeemed);
    
    if (order) {
      // Direct Thermal Print
      await thermalPrinter.printReceipt({
        shopName: "TN FRESHKART GREEN",
        billNumber: order.billNumber,
        date: new Date(order.createdAt).toLocaleString(),
        items: order.items.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          unit: item.product.unit,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal
        })),
        subtotal: order.subtotal,
        discount: order.discountTotal,
        tax: order.taxTotal,
        grandTotal: order.grandTotal,
        paymentMethod: method,
        cashTendered: method === 'CASH' ? numericTendered : undefined,
        changeReturned: method === 'CASH' ? changeReturned : undefined
      });
      
      // Open Web Invoice in new tab for A4/A5 printing
      window.open(`/invoice/${(order as any)._id || order.id}`, '_blank');
      
      onClose();
    }
    
    setIsProcessing(false);
  };

  const quickCashOptions = [
    grandTotal,
    Math.ceil(grandTotal / 100) * 100,
    Math.ceil(grandTotal / 500) * 500 || 500,
    1000,
    2000
  ].filter((v, i, self) => self.indexOf(v) === i && v >= grandTotal);

  const isCheckoutDisabled = isProcessing || (method === 'CASH' && numericTendered < grandTotal);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full flex flex-col overflow-hidden">
        {/* Modal Top Bar */}
        <div className="bg-theme-navy text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-bold text-lg tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-theme-teal" />
              Complete Checkout
            </h2>
            <p className="text-xs text-slate-300 font-mono mt-1">
              Customer: {selectedCustomer ? selectedCustomer.name : 'Walk-in Shopper'}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="w-8 h-8 rounded-full bg-theme-white/10 hover:bg-theme-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-5 bg-slate-50">
          {/* Payable Total */}
          <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                Total Payable Amount
              </span>
              <div className="text-[11px] text-emerald-600 mt-0.5">
                Includes {cart.length} items & all taxes
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold text-emerald-700">
                ₹{grandTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Points Redemption Toggle */}
          {selectedCustomer && selectedCustomer.points > 0 && (
            <div className="bg-theme-orange-light/30 p-4 rounded-lg border border-theme-orange/20 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wide">
                  Reward Points
                </span>
                <div className="text-[11px] text-amber-700 mt-0.5">
                  Available: {selectedCustomer.points} pts (₹{selectedCustomer.points})
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-sm font-bold text-amber-900">Use Points</span>
                  <input 
                    type="checkbox" 
                    checked={redeemPoints}
                    onChange={(e) => setRedeemPoints(e.target.checked)}
                    className="w-4 h-4 text-theme-orange rounded border-theme-orange/50 focus:ring-theme-orange"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Payment Method Boxes */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Payment Method
            </label>
            <div className={`grid gap-3 ${selectedCustomer ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-3'}`}>
              {[
                { id: 'CASH', label: 'Cash', icon: Banknote, activeText: 'text-emerald-600', activeRing: 'ring-emerald-500' },
                { id: 'UPI', label: 'UPI / QR', icon: QrCode, activeText: 'text-theme-blue', activeRing: 'ring-theme-blue' },
                { id: 'CARD', label: 'Card', icon: CreditCard, activeText: 'text-indigo-600', activeRing: 'ring-indigo-500' },
                ...(selectedCustomer ? [{ id: 'CREDIT', label: 'Ledger', icon: Banknote, activeText: 'text-theme-orange', activeRing: 'ring-theme-orange' }] : [])
              ].map(opt => {
                const Icon = opt.icon;
                const isSelected = method === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setMethod(opt.id as PaymentMethod)}
                    className={`flex flex-col items-center justify-center gap-2 py-3 px-2 rounded-xl border-2 transition-all hover:-translate-y-1 hover:shadow-md ${
                      isSelected 
                        ? `border-transparent bg-white shadow-md ring-2 ${opt.activeRing}/50` 
                        : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${isSelected ? opt.activeText : 'text-slate-400'}`} />
                    <span className={`text-xs font-bold ${isSelected ? opt.activeText : 'text-slate-600'}`}>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Payment Details */}
          {method === 'CASH' && (
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Cash Tendered Amount (₹)
                </label>
                <input
                  type="number"
                  autoFocus
                  placeholder="Enter amount"
                  value={tendered}
                  onChange={(e) => setTendered(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-md text-lg font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner"
                />
              </div>

              <div>
                <span className="block text-xs font-medium text-slate-500 mb-2">Quick Cash:</span>
                <div className="flex flex-wrap gap-2">
                  {quickCashOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setTendered(opt)}
                      className={`px-3 py-1.5 rounded-md border text-sm font-bold transition-all ${
                        tendered === opt
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400'
                      }`}
                    >
                      ₹{opt}
                    </button>
                  ))}
                </div>
              </div>

              {changeReturned > 0 && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-600">Change to Return:</span>
                  <span className="text-2xl font-extrabold text-emerald-600">
                    ₹{changeReturned.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}

          {method === 'UPI' && (
            <div className="bg-theme-white p-6 rounded-xl border border-theme-gray-border text-center space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                <QrCode className="w-8 h-8 text-theme-blue" />
              </div>
              <h3 className="font-bold text-theme-navy text-lg">UPI / QR Payment</h3>
              <p className="text-sm text-theme-gray-text">Please collect ₹{grandTotal} from the customer.</p>
              <div className="inline-block px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs rounded-lg mt-4">
                Confirm payment receipt before completing checkout
              </div>
            </div>
          )}

          {method === 'CARD' && (
            <div className="bg-theme-white p-5 rounded-xl border border-theme-gray-border space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-100 rounded-xl mb-2">
                <CreditCard className="w-6 h-6 text-indigo-600" />
                <span className="text-sm font-bold text-indigo-900">Swipe/Insert Card on Terminal</span>
              </div>
              <div>
                <label className="block text-xs font-mono font-bold text-theme-navy mb-2">
                  Card Number / Auth Ref (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Enter card number..."
                  value={cardRef}
                  onChange={(e) => setCardRef(e.target.value)}
                  className="w-full px-4 py-3 bg-theme-gray-light border border-theme-gray-border rounded-xl font-mono text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>
            </div>
          )}

          {method === 'CREDIT' && selectedCustomer && (
            <div className="bg-theme-orange-light/20 p-6 rounded-xl border border-theme-orange/20 text-center space-y-3 animate-in fade-in slide-in-from-bottom-2">
              <h3 className="font-bold text-amber-900 text-lg">Charge to Ledger</h3>
              <p className="text-sm text-amber-700">This will add ₹{grandTotal.toLocaleString('en-IN')} to {selectedCustomer.name}'s outstanding balance.</p>
              <div className="flex justify-between items-center text-xs mt-4 pt-4 border-t border-theme-orange/20">
                <span className="font-bold text-amber-800">Current Outstanding:</span>
                <span className="font-black text-rose-600">₹{selectedCustomer.outstanding || 0}</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Button Footer - Always visible */}
        <div className="p-4 bg-white border-t border-slate-200 shrink-0 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              if (cart.length > 0) {
                holdCurrentBill();
                setSelectedCustomer(null);
                onClose();
              }
            }}
            disabled={isProcessing || cart.length === 0}
            className="py-2.5 px-5 border-2 border-theme-orange/20 bg-theme-orange-light/20 hover:bg-theme-orange-light/50 text-amber-800 font-bold rounded-lg text-sm transition-colors flex items-center gap-2"
          >
            <span>Hold Bill</span>
          </button>

          <button
            type="button"
            onClick={handlePay}
            disabled={isCheckoutDisabled}
            className="flex-1 py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                <span>PROCESSING...</span>
              </>
            ) : (
              <>
                <span>Complete Checkout & Print Receipt</span>
                <Printer className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
