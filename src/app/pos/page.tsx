'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePOS } from '../../context/POSContext';
import { Product } from '../../types/pos';
import { PaymentModal } from '../../components/pos/PaymentModal';
import { HoldBillsModal } from '../../components/pos/HoldBillsModal';
import { CalculatorModal } from '../../components/pos/CalculatorModal';
import { Toast } from '../../components/common/Toast';
import { 
  Plus, Minus, Trash2, ShoppingCart, CreditCard, Clock, 
  ArrowLeft, User, Sparkles, AlertTriangle, Search, CheckCircle2,
  Store, Star, ChevronDown, Zap, Barcode, HelpCircle, X,
  Maximize, Calculator, Printer
} from 'lucide-react';
import pageBg from '@/asset/images/pagebg.jpg';

export default function POSCheckoutPage() {
  const {
    products,
    cart,
    setCart,
    orders,
    addToCart,
    updateCartQty,
    setCartQtyDirect,
    removeFromCart,
    clearCart,
    holdCurrentBill,
    heldBills,
    customers,
    employees,
    selectedEmployee,
    setSelectedEmployee,
    selectedCustomer,
    setSelectedCustomer,
    lookupProductByBarcodeOrSku,
    showToast
  } = usePOS();

  const [scanInput, setScanInput] = useState('');
  const [isProcessingScan, setIsProcessingScan] = useState(false);
  const [isReturnMode, setIsReturnMode] = useState(false);
  const [scanErrorMsg, setScanErrorMsg] = useState<string | null>(null);

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isHeldOpen, setIsHeldOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

  const [weightEntryProduct, setWeightEntryProduct] = useState<Product | null>(null);
  const [enteredWeight, setEnteredWeight] = useState<string>('');
  const weightInputRef = useRef<HTMLInputElement>(null);

  const [customerMobile, setCustomerMobile] = useState('');
  const [allCustomers, setAllCustomers] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/customers')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAllCustomers(data.data);
        }
      })
      .catch(() => {});

    fetch('/api/units?active=true')
      .then(res => res.json())
      .then(data => setUnits(data))
      .catch(() => {});
  }, []);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);

  const scannerInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus scanner input field on mount & keep focus after scans
  const focusScannerInput = () => {
    if (isPaymentOpen || isHeldOpen || weightEntryProduct || showNameInput) return;
    
    setTimeout(() => {
      // Check activeElement inside the timeout to ensure focus hasn't intentionally moved
      if (document.activeElement && 
          ['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName) && 
          document.activeElement !== scannerInputRef.current) {
        return;
      }
      scannerInputRef.current?.focus();
    }, 50);
  };

  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    focusScannerInput();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        scannerInputRef.current?.focus();
      } else if (e.key === 'F4') {
        e.preventDefault();
        if (cart.length > 0) setIsPaymentOpen(true);
      } else if (e.key === 'F8') {
        e.preventDefault();
        if (cart.length > 0) holdCurrentBill();
      } else if (e.key === 'Escape') {
        clearCart();
        focusScannerInput();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, holdCurrentBill, clearCart]);

  // Main Barcode / QR Scanner Input Handler (Triggers on Enter suffix from scanner)
  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = scanInput.trim();
    if (!query || isProcessingScan) return;

    setIsProcessingScan(true);
    setScanErrorMsg(null);

    try {
      // 1. First check in local products state cache
      let matched = products.find(
        p => p.barcode === query || 
             p.sku.toLowerCase() === query.toLowerCase() ||
             p.name.toLowerCase().includes(query.toLowerCase())
      );

      // 2. If not found in local cache, query MongoDB lookup API directly
      if (!matched) {
        matched = await lookupProductByBarcodeOrSku(query) || undefined;
      }

      if (matched) {
        if (['KG', 'GRAM', 'LITRE', 'ML'].includes(matched.unit)) {
          setWeightEntryProduct(matched);
          setTimeout(() => weightInputRef.current?.focus(), 50);
        } else {
          addToCart(matched, isReturnMode ? -1 : 1);
        }
        setScanInput('');
      } else {
        setScanErrorMsg(`Product not found for SKU / Barcode "${query}"`);
        showToast(`❌ Product not found for "${query}"`);
        setScanInput('');
      }
    } catch (err: any) {
      setScanErrorMsg(err.message || 'Scan error');
    } finally {
      setIsProcessingScan(false);
      setIsProcessingScan(false);
      focusScannerInput();
    }
  };

  const handleCustomerMobileSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const mobile = customerMobile.trim();
      if (mobile.length < 10) return;
      setIsSearchingCustomer(true);
      setShowNameInput(false);
      try {
        const res = await fetch(`/api/customers?mobile=${mobile}`);
        const json = await res.json();
        if (json.success && json.data) {
          const c = json.data;
          setSelectedCustomer({
            id: c._id,
            name: c.name,
            mobile: c.mobile,
            points: c.points,
            outstanding: c.outstanding || 0
          });
          showToast(`✓ Customer ${c.name} attached`);
          focusScannerInput();
        } else {
          setShowNameInput(true);
          showToast('New Customer! Please enter name.');
        }
      } catch (err) {
        showToast('Error searching customer');
      } finally {
        setIsSearchingCustomer(false);
      }
    }
  };

  const handleCreateCustomer = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!newCustomerName) return;
      try {
        const res = await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newCustomerName, mobile: customerMobile, points: 0 })
        });
        const json = await res.json();
        if (json.success) {
          const c = json.data;
          setSelectedCustomer({
            id: c._id,
            name: c.name,
            mobile: c.mobile,
            points: c.points,
            outstanding: c.outstanding || 0
          });
          showToast(`✓ Registered & attached ${c.name}`);
          setNewCustomerName('');
          setShowNameInput(false);
          focusScannerInput();
        } else {
          showToast(`❌ Error: ${json.error}`);
        }
      } catch (err) {
        showToast('Error creating customer');
      }
    }
  };

  const handleWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightEntryProduct || !enteredWeight) return;
    
    const qtyEntered = parseFloat(enteredWeight);
    if (qtyEntered > 0) {
      addToCart(weightEntryProduct, isReturnMode ? -qtyEntered : qtyEntered);
    }
    
    setWeightEntryProduct(null);
    setEnteredWeight('');
    focusScannerInput();
  };

  // Cart totals calculations
  const totalUnits = Number(cart.reduce((acc, item) => acc + item.quantity, 0).toFixed(3));
  const subtotal = cart.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const taxTotal = cart.reduce((acc, item) => acc + item.taxAmount, 0);
  const discountTotal = cart.reduce((acc, item) => {
    const regularSub = item.quantity * item.unitPrice;
    return acc + (regularSub - item.subtotal);
  }, 0);
  const totalMRP = cart.reduce((acc, item) => acc + (item.quantity * item.product.mrp), 0);
  const grandTotal = Math.round(subtotal - discountTotal + taxTotal);
  const totalSavings = (totalMRP - grandTotal) > 0 ? (totalMRP - grandTotal) : 0;

  // Compute autocomplete suggestions
  const suggestedProducts = scanInput.trim().length > 0 
    ? products.filter(p => 
        p.name.toLowerCase().includes(scanInput.toLowerCase()) || 
        p.sku.toLowerCase().includes(scanInput.toLowerCase()) ||
        p.barcode.includes(scanInput)
      ).slice(0, 8)
    : [];

  return (
    <div className="min-h-screen w-screen bg-theme-gray-light text-theme-navy flex flex-col overflow-x-hidden font-sans select-none relative">
      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{ 
          backgroundImage: `url(${pageBg.src})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center', 
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Stitch POS Navy Header Bar */}
      <header className="relative z-10 h-auto min-h-14 py-3 bg-white text-theme-navy px-4 flex flex-wrap items-center justify-between shadow-xs shrink-0 gap-y-2 border-b border-theme-gray-border">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/admin/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-theme-blue flex items-center justify-center text-white font-bold text-xl shadow-md transition-colors shrink-0">
              <Store className="w-6 h-6" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-lg sm:text-xl text-theme-navy tracking-tight flex items-center gap-1.5 whitespace-nowrap">
                TN FRESHKART <span className="text-theme-teal">GREEN</span>
              </span>
              <span className="text-[10px] sm:text-xs text-theme-orange font-bold uppercase tracking-wider">Smart Grocery Shop</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-2 bg-theme-gray-light px-3 py-1 rounded-lg text-xs text-theme-navy border border-theme-navy/30 font-mono">
            <Barcode className="w-3.5 h-3.5 text-theme-navy" />
            <span>TN FRESHKART GREEN</span>
          </div>
        </div>

        {/* Hotkeys & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Always visible main actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsReturnMode(!isReturnMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors border ${
                isReturnMode 
                  ? 'bg-theme-navy text-white border-theme-navy shadow-inner' 
                  : 'bg-white text-theme-navy border-theme-navy hover:bg-theme-navy hover:text-white'
              }`}
            >
              <span>{isReturnMode ? 'RETURN MODE ACTIVE' : 'Return Mode'}</span>
            </button>

            <button
              onClick={() => setIsHeldOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-theme-navy hover:bg-theme-navy hover:text-white text-xs font-mono font-bold transition-colors border border-theme-navy group"
            >
              <Clock className="w-3.5 h-3.5 text-current group-hover:text-white" />
              <span>Hold Bill ({heldBills.length})</span>
            </button>

            <button
              onClick={clearCart}
              disabled={cart.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-theme-navy hover:bg-theme-navy hover:text-white border border-theme-navy disabled:opacity-40 text-xs font-mono font-bold transition-colors group"
            >
              <Trash2 className="w-3.5 h-3.5 text-current group-hover:text-white" />
              <span>Clear [ESC]</span>
            </button>
          </div>

          {/* Utility Icons: Calculator, Print, Maximize */}
          <div className="flex items-center gap-2 pl-2 border-l border-theme-gray-border">
            <button 
              title="Calculator"
              onClick={() => setIsCalculatorOpen(true)}
              className="p-1.5 rounded-lg bg-white text-theme-navy hover:bg-theme-navy hover:text-white transition-colors border border-theme-navy group"
            >
              <Calculator className="w-4 h-4 text-current group-hover:text-white" />
            </button>
            <button 
              title="Print Last Bill"
              className="p-1.5 rounded-lg bg-white text-theme-navy hover:bg-theme-navy hover:text-white transition-colors border border-theme-navy group"
            >
              <Printer className="w-4 h-4 text-current group-hover:text-white" />
            </button>
            <button 
              title="Fullscreen Mode"
              onClick={() => !document.fullscreenElement ? document.documentElement.requestFullscreen() : document.exitFullscreen()}
              className="p-1.5 rounded-lg bg-white text-theme-navy hover:bg-theme-navy hover:text-white transition-colors border border-theme-navy group"
            >
              <Maximize className="w-4 h-4 text-current group-hover:text-white" />
            </button>
          </div>

          {/* Live Date and Time */}
          {currentTime && (
            <div className="flex flex-col items-end border-l border-theme-gray-border pl-3 ml-1 text-[10px] sm:text-xs font-mono font-bold text-theme-navy leading-tight">
              <span>{currentTime.toLocaleDateString()}</span>
              <span>{currentTime.toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Terminal Split Grid */}
      <main className="relative z-10 flex-1 p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start max-w-(--breakpoint-2xl) mx-auto w-full">
        
        {/* LEFT SECTION: 8 Cols - Customer Strip, Laser Barcode Scanner & Active Cart Ledger */}
        <div className="lg:col-span-8 flex flex-col gap-3 min-w-0">
          
          {/* 1. CUSTOMER LOYALTY & REGISTER STRIP */}
          <div className="bg-theme-white rounded-xl p-3 shadow-xs border border-theme-gray-border flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-theme-teal flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-theme-navy truncate">
                    {selectedCustomer ? selectedCustomer.name : 'Walk-in Shopper'}
                  </span>
                  {selectedCustomer && (
                    <span className="bg-theme-orange-light text-amber-900 text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current text-theme-orange" />
                      Member
                    </span>
                  )}
                </div>
                {selectedCustomer && (
                  <div className="flex items-center gap-3 text-theme-gray-text font-mono text-[11px] mt-0.5">
                    <span>PH: <strong className="text-theme-navy">{selectedCustomer.mobile}</strong></span>
                    <span>•</span>
                    <span>Pts: <strong className="text-theme-teal">{selectedCustomer.points}</strong></span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 flex gap-2">
              <div className="flex gap-2 flex-1 items-center">
                <div className="relative flex-1">
                  <select
                    value={selectedCustomer?.id || selectedCustomer?._id || ''}
                    onChange={(e) => {
                      if (!e.target.value) {
                        setSelectedCustomer(null);
                        setCustomerMobile('');
                      } else {
                        const cust = allCustomers.find(c => c._id === e.target.value);
                        if (cust) {
                          setSelectedCustomer({
                            id: cust._id,
                            name: cust.name,
                            mobile: cust.mobile,
                            points: cust.points,
                            outstanding: cust.outstanding || 0
                          });
                        }
                      }
                      focusScannerInput();
                    }}
                    className="w-full pl-3 pr-8 py-1.5 bg-theme-gray-light border border-theme-gray-border rounded-lg text-xs font-mono outline-none focus:border-theme-blue appearance-none"
                  >
                    <option value="">Walk-in Shopper</option>
                    {allCustomers.map(c => (
                      <option key={c._id} value={c._id}>{c.name} ({c.mobile})</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-2 text-theme-gray-text pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* 2. AUTO-FOCUSED SCANNER INPUT WITH LASER ANIMATION LINE (Requirement #2 & #5 & #17) */}
          <div className="bg-white rounded-xl p-4 shadow-md relative z-20 space-y-2 border border-slate-100">
            {/* Laser Beam Animation Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-400 to-emerald-500/0 animate-pulse rounded-t-xl"></div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[10px] sm:text-xs font-mono text-theme-gray-text gap-1 sm:gap-2">
              <span className="font-bold text-theme-blue uppercase flex items-center gap-1.5 leading-tight">
                <Barcode className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600 shrink-0" />
                <span className="truncate">AUTO BARCODE SCANNER</span>
              </span>
              <span className="text-[9px] sm:text-[10px] bg-theme-teal/20 text-emerald-800 px-1.5 sm:px-2 py-0.5 rounded font-bold whitespace-nowrap shrink-0">
                CONTINUOUS SCANNING
              </span>
            </div>

            <form onSubmit={handleScanSubmit} className="relative flex items-stretch sm:items-center gap-1.5 sm:gap-2">
              <div className="relative flex-1 min-w-0">
                <Barcode className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 absolute left-2 sm:left-3.5 top-1/2 -translate-y-1/2 animate-pulse" />
                <input
                  ref={scannerInputRef}
                  type="text"
                  placeholder="Scan Barcode or Search..."
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  onBlur={(e) => {
                    if (e.relatedTarget && ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes((e.relatedTarget as HTMLElement).tagName)) {
                      return;
                    }
                    focusScannerInput();
                  }}
                  className="w-full h-10 sm:h-12 pl-8 sm:pl-12 pr-16 sm:pr-28 bg-slate-50 hover:bg-slate-100 rounded-lg sm:rounded-xl text-theme-navy font-mono text-xs sm:text-sm font-extrabold outline-none focus:outline-none border-none shadow-none transition-all"
                />
                <div className="absolute inset-y-0 right-0 pr-1 sm:pr-2 flex items-center gap-1 pointer-events-none">
                  <span className="font-mono text-[8px] sm:text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded shadow-2xs whitespace-nowrap">
                    READY
                  </span>
                </div>

                {/* Autocomplete Dropdown */}
                {suggestedProducts.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-theme-white border border-theme-gray-border rounded-xl shadow-lg z-50 overflow-hidden divide-y divide-slate-100 max-h-64 overflow-y-auto">
                    {suggestedProducts.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-theme-gray-light flex items-center justify-between transition-colors focus:bg-theme-gray-light outline-none"
                        onClick={() => {
                          if (['kg', 'g', 'litre', 'ml'].includes((p.unit || '').toLowerCase())) {
                            setWeightEntryProduct(p);
                            setTimeout(() => weightInputRef.current?.focus(), 50);
                          } else {
                            addToCart(p, isReturnMode ? -1 : 1);
                          }
                          setScanInput('');
                          focusScannerInput();
                        }}
                      >
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-theme-navy text-xs sm:text-sm truncate">{p.name}</span>
                          <span className="text-[9px] sm:text-[10px] text-theme-blue font-mono truncate">SKU: {p.sku} | Barcode: {p.barcode}</span>
                        </div>
                        <span className="font-bold text-theme-teal text-xs sm:text-sm pl-2 shrink-0">₹{p.sellingPrice.toFixed(2)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </form>

            {scanErrorMsg && (
              <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 font-mono text-xs font-bold flex items-center justify-between">
                <span>⚠️ {scanErrorMsg}</span>
                <span className="text-[10px] text-theme-gray-text font-normal">Emergency keyboard backup: Add SKU in Admin Inventory</span>
              </div>
            )}
          </div>

          {/* 3. ACTIVE SCANNED CART LEDGER TABLE (Requirement #2 & #4: Increments quantity on same SKU scan) */}
          <div className="bg-theme-white rounded-xl shadow-xs border border-theme-gray-border overflow-hidden flex flex-col">
            <div className="bg-theme-gray-light px-3 sm:px-4 py-2 sm:py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-theme-gray-border gap-1 sm:gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-theme-teal shrink-0" />
                <span className="font-bold text-xs sm:text-sm text-theme-navy">Current Bill Items</span>
                <span className="bg-theme-teal/20 text-emerald-800 font-mono text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                  {cart.length} SKUs • {totalUnits} Units
                </span>
              </div>
              <span className="font-mono text-[9px] sm:text-[10px] text-theme-gray-text hidden sm:inline-block">
                LIVE DB LOOKUP ACTIVE
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-theme-gray-light text-theme-gray-text text-[10px] uppercase border-b border-theme-gray-border">
                    <th className="p-1.5 sm:p-3 text-center w-6 sm:w-10">#</th>
                    <th className="p-1.5 sm:p-3">Product Name</th>
                    <th className="p-1.5 sm:p-3">SKU</th>
                    <th className="p-1.5 sm:p-3 text-center">Unit</th>
                    <th className="p-1.5 sm:p-3 text-right">Selling Price</th>
                    <th className="p-1.5 sm:p-3 text-center w-24 sm:w-32">Scanned Qty</th>
                    <th className="p-1.5 sm:p-3 text-right">Line Total</th>
                    <th className="p-1.5 sm:p-3 text-center w-6 sm:w-10">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cart.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-slate-400 font-mono text-xs">
                        <Barcode className="w-12 h-12 mx-auto text-slate-300 mb-2 animate-pulse" />
                        Ready for scanner input.<br />Point your barcode scanner at a product to start billing.
                      </td>
                    </tr>
                  ) : (
                    cart.map((item, idx) => (
                      <tr key={item.product.id} className="hover:bg-theme-gray-light/80">
                        <td className="p-1.5 sm:p-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                        <td className="p-1.5 sm:p-3 min-w-[100px]">
                          <div className="font-bold font-sans text-theme-navy text-xs sm:text-sm leading-tight">{item.product.name}</div>
                          <div className="text-[9px] sm:text-[10px] text-slate-400">Barcode: {item.product.barcode}</div>
                        </td>
                        <td className="p-1.5 sm:p-3">
                          <span className="font-bold text-theme-blue text-[10px] sm:text-xs">{item.product.sku}</span>
                        </td>
                        <td className="p-1.5 sm:p-3 text-center">
                          <select
                            value={item.product.unit || ''}
                            onChange={(e) => {
                              setCart(prev => prev.map(i => i.product.id === item.product.id ? { ...i, product: { ...i.product, unit: e.target.value } } : i));
                            }}
                            className="bg-theme-gray-light border border-theme-gray-border rounded-lg text-xs font-mono outline-none py-1 px-2 appearance-none text-center min-w-[50px] font-bold"
                          >
                            <option value="">-</option>
                            {units.length > 0 ? units.map(u => (
                              <option key={u._id} value={u._id}>{u.shortCode}</option>
                            )) : (
                              <>
                                <option value="piece">piece</option>
                                <option value="kg">kg</option>
                                <option value="g">g</option>
                                <option value="litre">litre</option>
                                <option value="ml">ml</option>
                                <option value="packet">packet</option>
                              </>
                            )}
                          </select>
                        </td>
                        <td className="p-1.5 sm:p-3 text-right font-bold text-theme-navy text-[10px] sm:text-xs">
                          ₹{item.unitPrice.toFixed(2)}
                        </td>
                        <td className="p-1.5 sm:p-3 text-center">
                          {/* Quantity error handling steppers (Requirement #6) */}
                          <div className="inline-flex items-center border border-theme-gray-border rounded-lg overflow-hidden bg-theme-white shadow-2xs">
                            <button
                              onClick={() => { updateCartQty(item.product.id, isReturnMode ? 1 : -1); focusScannerInput(); }}
                              className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-theme-gray-text hover:bg-theme-gray-light font-bold"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              step="any"
                              value={isReturnMode ? -item.quantity : item.quantity}
                              onChange={(e) => { 
                                const val = parseFloat(e.target.value);
                                setCartQtyDirect(item.product.id, isReturnMode ? -val : (val || 1)); 
                                focusScannerInput(); 
                              }}
                              className="w-12 sm:w-16 text-center font-bold text-theme-navy text-xs bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button
                              onClick={() => { updateCartQty(item.product.id, isReturnMode ? -1 : 1); focusScannerInput(); }}
                              className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-theme-gray-text hover:bg-theme-gray-light font-bold"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="p-1.5 sm:p-3 text-right font-bold text-theme-teal text-xs sm:text-sm">
                          ₹{item.subtotal.toFixed(2)}
                        </td>
                        <td className="p-1.5 sm:p-3 text-center">
                          <button
                            onClick={() => { removeFromCart(item.product.id); focusScannerInput(); }}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                            title="Remove line item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION: 4 Cols - Bill Total & Pay Now Button */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {/* Bill Summary Drawer */}
          <div className="bg-theme-white p-4 rounded-xl border border-theme-gray-border shadow-xs space-y-2 font-mono text-xs text-theme-navy">
            <h3 className="font-bold text-theme-navy uppercase tracking-wider text-[11px] border-b pb-1.5 mb-2 flex justify-between items-center">
              <span>Bill Summary</span>
              <span className="text-theme-teal">#TNFG{(orders.length + 1).toString().padStart(2, '0')}</span>
            </h3>
            <div className="flex justify-between">
              <span>Total Bill Items:</span>
              <span className="font-bold text-theme-navy">{totalUnits} units</span>
            </div>
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-bold">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-theme-gray-text">
              <span>Estimated Tax:</span>
              <span>₹{taxTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Amount Due Box & PAY NOW CTA */}
          <div className="bg-white p-5 rounded-xl text-black shadow space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-mono text-black font-bold uppercase tracking-widest">
                GRAND TOTAL
              </span>
              <span className="text-[10px] font-mono text-slate-500">LIVE DATA</span>
            </div>

            <div className="text-4xl font-mono font-extrabold text-theme-teal tracking-tight">
              ₹{grandTotal.toLocaleString('en-IN')}.00
            </div>

            <button
              onClick={() => setIsPaymentOpen(true)}
              disabled={cart.length === 0}
              className="w-full h-14 bg-theme-navy hover:bg-blue-900 disabled:opacity-40 text-white font-bold rounded-xl text-base font-mono flex items-center justify-center gap-2 shadow-xl transition-all active:scale-98"
            >
              <CreditCard className="w-6 h-6" />
              <span>COMPLETE BILL [F4]</span>
            </button>
          </div>
        </div>
      </main>

      {/* Modals & Toast */}
      {isPaymentOpen && <PaymentModal onClose={() => { setIsPaymentOpen(false); focusScannerInput(); }} />}
      {isHeldOpen && <HoldBillsModal onClose={() => { setIsHeldOpen(false); focusScannerInput(); }} />}
      
      {weightEntryProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-theme-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
            <div className="bg-theme-navy text-white px-5 py-4 flex items-center justify-between">
              <h2 className="font-bold text-base">
                Enter {['kg', 'g'].includes(weightEntryProduct.unit) ? 'Weight' : 'Volume'} ({weightEntryProduct.unit.toUpperCase()})
              </h2>
              <button
                onClick={() => {
                  setWeightEntryProduct(null);
                  setEnteredWeight('');
                  focusScannerInput();
                }}
                className="w-8 h-8 rounded-full bg-theme-white/10 hover:bg-theme-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleWeightSubmit} className="p-5 space-y-4">
              <div className="bg-theme-gray-light p-3 rounded-xl border border-theme-gray-border">
                <div className="font-bold text-theme-navy">{weightEntryProduct.name}</div>
                <div className="text-xs text-theme-gray-text mt-1">
                  Price per {weightEntryProduct.unit.toUpperCase()}: ₹{weightEntryProduct.pricePerKg || weightEntryProduct.sellingPrice}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-theme-navy mb-2">
                  Quantity in {weightEntryProduct.unit.toUpperCase()}
                </label>
                <input
                  ref={weightInputRef}
                  type="number"
                  required
                  min="0.001"
                  step="0.001"
                  value={enteredWeight}
                  onChange={(e) => setEnteredWeight(e.target.value)}
                  placeholder={['kg', 'l'].includes(weightEntryProduct.unit) ? "e.g. 1.250" : "e.g. 250"}
                  className="w-full text-center text-2xl font-bold px-4 py-3 border border-theme-gray-border rounded-xl focus:border-theme-blue focus:ring-2 focus:ring-theme-blue/20 outline-none"
                />
              </div>

              {enteredWeight && parseFloat(enteredWeight) > 0 && (
                <div className="text-center font-bold text-theme-teal text-lg">
                  Amount: ₹{
                    (
                      (['kg', 'l'].includes(weightEntryProduct.unit) 
                        ? (weightEntryProduct.pricePerKg || weightEntryProduct.sellingPrice) 
                        : (weightEntryProduct.pricePerKg || weightEntryProduct.sellingPrice) / 1000
                      ) * parseFloat(enteredWeight)
                    ).toFixed(2)
                  }
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-theme-blue hover:bg-theme-blue text-white font-bold rounded-xl shadow-md text-lg"
              >
                Add to Bill [Enter]
              </button>
            </form>
          </div>
        </div>
      )}

      {isCalculatorOpen && (
        <CalculatorModal onClose={() => { setIsCalculatorOpen(false); focusScannerInput(); }} />
      )}

      <Toast />
    </div>
  );
}
