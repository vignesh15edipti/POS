'use client';

import React from 'react';
import { usePOS } from '../../context/POSContext';
import { X, Play, Trash2, Clock, ShoppingCart } from 'lucide-react';

interface HoldBillsModalProps {
  onClose: () => void;
}

export const HoldBillsModal: React.FC<HoldBillsModalProps> = ({ onClose }) => {
  const { heldBills, restoreHeldBill, deleteHeldBill } = usePOS();

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-theme-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[80vh]">
        {/* Top bar */}
        <div className="bg-theme-navy text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-theme-orange" />
            <span className="font-bold text-base">Held Transactions ({heldBills.length})</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-theme-white/10 hover:bg-theme-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of held bills */}
        <div className="p-4 overflow-y-auto space-y-3 bg-theme-gray-light flex-1">
          {heldBills.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-mono text-xs space-y-2">
              <ShoppingCart className="w-10 h-10 mx-auto text-slate-300" />
              <p>No held bills currently in queue.</p>
            </div>
          ) : (
            heldBills.map((bill) => {
              const billTotal = bill.items.reduce((acc, item) => acc + item.subtotal, 0);
              return (
                <div
                  key={bill.id}
                  className="bg-theme-white p-4 rounded-xl border border-theme-gray-border shadow-xs flex items-center justify-between gap-3 hover:border-theme-blue transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-xs text-theme-blue bg-blue-50 px-2 py-0.5 rounded">
                        #{bill.id}
                      </span>
                      <span className="text-xs text-theme-gray-text font-mono">{bill.heldAt}</span>
                    </div>
                    <div className="font-bold text-sm text-theme-navy mt-1">
                      {bill.customerName} ({bill.customerMobile})
                    </div>
                    <div className="text-xs text-theme-gray-text mt-0.5">
                      {bill.items.length} items • <span className="font-bold text-theme-navy font-mono">₹{billTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => deleteHeldBill(bill.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Held Bill"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        restoreHeldBill(bill.id);
                        onClose();
                      }}
                      className="px-3.5 py-1.5 bg-theme-blue hover:bg-theme-blue text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Resume</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-theme-white border-t border-theme-gray-border text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-theme-gray-light hover:bg-slate-200 text-theme-navy font-bold rounded-xl text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
