'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Product, CartItem, Order, HeldBill, Customer, Supplier, ShiftInfo, UserUser, PaymentDetails 
} from '../types/pos';
import { initialCustomers, initialSuppliers, initialUsers } from '../data/mockData';

export interface DashboardStats {
  totalProducts: number;
  totalQty: number;
  totalInventoryValue: number;
  totalRetailValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  todayBillsCount: number;
  todaySales: number;
  totalBills: number;
  totalSales: number;
  topSellingProducts: Array<{
    name: string;
    sku: string;
    totalQuantitySold: number;
    totalRevenue: number;
  }>;
  recentBills: Array<any>;
  recentStockLogs: Array<{
    _id: string;
    productName: string;
    sku: string;
    type: string;
    qtyChanged: number;
    resultingQty: number;
    reason: string;
    createdAt: string;
  }>;
}

interface POSContextType {
  employees: any[];
  selectedEmployee: any | null;
  setSelectedEmployee: (emp: any | null) => void;
  products: Product[];
  isLoadingProducts: boolean;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  orders: Order[];
  heldBills: HeldBill[];
  customers: Customer[];
  suppliers: Supplier[];
  activeUser: UserUser | null;
  loginUser: (user: UserUser) => void;
  logoutUser: () => void;
  activeShift: ShiftInfo;
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;
  dashboardStats: DashboardStats | null;
  stockHistoryLogs: any[];
  
  // API Actions connected to MongoDB
  fetchProducts: (query?: string, category?: string, stockStatus?: string) => Promise<void>;
  fetchDashboardStats: () => Promise<void>;
  fetchStockHistory: () => Promise<void>;
  
  lookupProductByBarcodeOrSku: (query: string) => Promise<Product | null>;
  addToCart: (product: Product, qty?: number) => void;
  updateCartQty: (productId: string, delta: number) => void;
  setCartQtyDirect: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  
  holdCurrentBill: (note?: string) => void;
  restoreHeldBill: (heldBillId: string) => void;
  deleteHeldBill: (heldBillId: string) => void;
  
  processCheckout: (payments: PaymentDetails[], pointsRedeemed?: number) => Promise<Order | null>;
  cancelBillInDb: (billId: string) => Promise<void>;
  
  addProduct: (product: Omit<Product, 'id'>) => Promise<{ isDuplicateSkuUpdate?: boolean; message?: string }>;
  updateProduct: (id: string, updated: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  adjustStock: (id: string, adjustmentType: string, quantity: number, reason?: string, batchNumber?: string, expiryDate?: string) => Promise<void>;
  
  addCustomer: (customer: Omit<Customer, 'id'>) => Customer;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'pendingOrdersCount' | 'totalBalance'>) => void;
  closeCurrentShift: (cash?: number) => void;
  openShift: (float: number) => Promise<void>;
  
  receiptOrder: Order | null;
  setReceiptOrder: (order: Order | null) => void;
  toastMessage: string | null;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [heldBills, setHeldBills] = useState<HeldBill[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [activeUser, setActiveUser] = useState<UserUser | null>(null);

  useEffect(() => {
    // Client-side init
    const stored = localStorage.getItem('freshkart_active_user');
    if (stored) {
      try {
        setActiveUser(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  const loginUser = (user: UserUser) => {
    setActiveUser(user);
    localStorage.setItem('freshkart_active_user', JSON.stringify(user));
  };

  const logoutUser = () => {
    setActiveUser(null);
    localStorage.removeItem('freshkart_active_user');
    // We don't redirect here, we let the components redirect
  };
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [stockHistoryLogs, setStockHistoryLogs] = useState<any[]>([]);
  
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [activeShift, setActiveShift] = useState<ShiftInfo>({
    id: '',
    shiftStart: new Date().toISOString(),
    cashierName: 'Alex Mercer',
    counterId: 'COUNTER-01',
    openingFloat: 0,
    cashSales: 0,
    cardSales: 0,
    upiSales: 0,
    totalSales: 0,
    status: 'CLOSED'
  });

  const fetchShift = async () => {
    try {
      const res = await fetch('/api/shifts/current');
      const data = await res.json();
      if (data.success && data.data) {
        setActiveShift({
          id: data.data._id,
          shiftStart: data.data.shiftStart,
          cashierName: data.data.cashierName,
          counterId: data.data.counterId,
          openingFloat: data.data.openingFloat,
          cashSales: data.data.cashSales,
          cardSales: data.data.cardSales,
          upiSales: data.data.upiSales,
          totalSales: data.data.cashSales + data.data.cardSales + data.data.upiSales,
          status: data.data.status
        });
      }
    } catch (err) {
      console.error('Failed to fetch active shift:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchDashboardStats();
    fetchStockHistory();
    fetchShift();
  }, []);

  const showToast = (msg: string, type?: 'success' | 'error' | 'info') => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  useEffect(() => {
    fetch('/api/employees').then(r => r.json()).then(json => {
      if (json.success && json.data) {
        setEmployees(json.data);
        if (json.data.length > 0) setSelectedEmployee(json.data[0]);
      }
    }).catch(console.error);

    fetch('/api/customers').then(r => r.json()).then(json => {
      if (json.success && json.data) {
        setCustomers(json.data.map((c: any) => ({
          id: c._id,
          name: c.name,
          mobile: c.mobile,
          points: c.points,
          tier: 'SILVER',
          creditLimit: 0,
          totalSpent: 0,
          outstandingBalance: 0,
          lastVisit: c.createdAt
        })));
      }
    }).catch(console.error);
  }, []);

  // 1. Fetch live products from MongoDB API
  const fetchProducts = useCallback(async (query: string = '', category: string = '', stockStatus: string = '') => {
    try {
      setIsLoadingProducts(true);
      const params = new URLSearchParams();
      if (query) params.set('search', query);
      if (category && category !== 'ALL') params.set('category', category);
      if (stockStatus) params.set('stockStatus', stockStatus);

      const res = await fetch(`/api/products?${params.toString()}`);
      const json = await res.json();

      if (json.success && json.data) {
        const mappedProducts: Product[] = json.data.map((p: any) => ({
          id: p._id,
          name: p.name,
          sku: p.sku,
          barcode: p.barcode,
          category: p.category,
          unit: p.unit || 'piece',
          purchasePrice: p.purchasePrice || p.purchasePrice || 0,
          sellingPrice: p.sellingPrice || 0,
          mrp: p.mrp || p.sellingPrice || 0,
          taxRate: 5,
          hsnCode: '1001',
          stockQuantity: p.quantity,
          minimumStock: p.minimumStock || 10,
          imageUrl: p.imageUrl,
          isActive: p.isActive,
        }));
        setProducts(mappedProducts);
      }
    } catch (err) {
      console.error('Error fetching products from MongoDB API:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  // 2. Fetch Dashboard stats from MongoDB Aggregation API
  const fetchDashboardStats = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/stats');
      const json = await res.json();
      if (json.success && json.data) {
        setDashboardStats(json.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats from API:', err);
    }
  }, []);

  // 3. Fetch Stock History Logs
  const fetchStockHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/inventory/history');
      const json = await res.json();
      if (json.success && json.data) {
        setStockHistoryLogs(json.data);
      }
    } catch (err) {
      console.error('Error fetching stock history:', err);
    }
  }, []);

  // 4. Fetch Bills List from MongoDB
  const fetchBills = useCallback(async () => {
    try {
      const res = await fetch('/api/sales');
      const json = await res.json();
      if (json.success && json.data) {
        const mappedOrders: Order[] = json.data.map((b: any) => ({
          id: b._id,
          billNumber: b.invoiceNumber || b.billNumber || b._id.toString().slice(-6),
          createdAt: b.createdAt,
          cashierName: b.cashierName || 'Alex Mercer',
          cashierId: b.cashierId || 'usr-01',
          counterId: 'COUNTER-01',
          customerName: b.customerName || 'Walk-in',
          customerMobile: '-',
          items: b.items.map((item: any) => ({
            product: {
              id: item.productId,
              name: item.productName || item.name,
              sku: item.sku,
              barcode: item.barcode,
              sellingPrice: item.sellingPriceAtSale || item.price,
              mrp: item.sellingPriceAtSale || item.price || item.mrp,
              purchasePrice: item.purchasePriceAtSale || item.purchasePrice || 0,
              category: 'General',
              unit: item.unit || 'piece',
              taxRate: 0,
              hsnCode: '',
              stockQuantity: 0,
              minimumStock: 0,
              isActive: true
            },
            quantity: item.quantity,
            discountPercent: 0,
            unitPrice: item.sellingPriceAtSale || item.price,
            subtotal: item.lineTotal || item.total,
            taxAmount: item.tax || 0
          })),
          subtotal: b.subtotal,
          taxTotal: b.tax || 0,
          discountTotal: b.discount || 0,
          totalMRP: b.subtotal,
          totalSavings: b.discount || 0,
          grandTotal: b.grandTotal,
          payments: [{ 
            method: b.paymentMethod || 'CASH', 
            amount: b.grandTotal,
            tendered: b.amountReceived || b.grandTotal,
            changeReturned: b.change || 0
          }],
          status: b.status === 'CANCELLED' ? 'VOIDED' : 'COMPLETED',
          shiftId: b.shiftId || 'unknown'
        }));
        setOrders(mappedOrders);
      }
    } catch (err) {
      console.error('Error fetching bills:', err);
    }
  }, []);

  // Auto Initializer on Mount: Load MongoDB data
  useEffect(() => {
    const init = async () => {
      await fetchProducts();
      await fetchDashboardStats();
      await fetchStockHistory();
      await fetchBills();
    };
    init();
  }, [fetchProducts, fetchDashboardStats, fetchStockHistory, fetchBills]);

  // Lookup product via MongoDB API for Barcode / QR Scanner
  const lookupProductByBarcodeOrSku = async (query: string): Promise<Product | null> => {
    try {
      const res = await fetch(`/api/products/lookup?q=${encodeURIComponent(query)}`);
      const json = await res.json();
      if (json.success && json.data) {
        const p = json.data;
        return {
          id: p._id,
          name: p.name,
          sku: p.sku,
          barcode: p.barcode,
          category: p.category,
          unit: p.unit || 'PCS',
          purchasePrice: p.purchasePrice || 0,
          sellingPrice: p.sellingPrice || 0,
          mrp: p.mrp || p.sellingPrice || 0,
          pricePerKg: p.pricePerKg || undefined,
          taxRate: p.taxRate || 0,
          stockQuantity: p.quantity,
          minimumStock: p.minimumStock || 10,
          imageUrl: p.imageUrl,
          isActive: p.isActive,
        };
      }
    } catch (e) {
      console.error('Lookup product error:', e);
    }
    return null;
  };

  const addToCart = (product: Product, qty: number = 1) => {
    if (product.stockQuantity <= 0) {
      showToast(`⚠️ Out of stock: ${product.name}`);
    }

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id || item.product.sku === product.sku);
      
      const getUnitPrice = (p: Product) => {
        const u = (p.unit || '').toLowerCase();
        if (['kg', 'litre', 'l'].includes(u)) {
          return (p.pricePerKg || p.sellingPrice);
        }
        if (['gram', 'g', 'ml'].includes(u)) {
          return (p.pricePerKg || p.sellingPrice) / 1000;
        }
        return p.sellingPrice;
      };

      if (existing) {
        // If weight based, we don't automatically add 1 to quantity (this is handled in POS UI by passing the entered weight).
        // If piece based, it's just +1.
        const newQty = existing.quantity + qty;
        const subtotal = newQty * existing.unitPrice;
        const taxRate = existing.product.taxRate || 0;
        const taxAmount = (subtotal * taxRate) / 100;
        return prev.map(item => 
          (item.product.id === product.id || item.product.sku === product.sku)
            ? { ...item, quantity: newQty, subtotal, taxAmount }
            : item
        );
      } else {
        const unitPrice = getUnitPrice(product);
        const subtotal = qty * unitPrice;
        const taxRate = product.taxRate || 0;
        const taxAmount = (subtotal * taxRate) / 100;
        return [...prev, {
          product,
          quantity: qty,
          discountPercent: 0,
          unitPrice,
          subtotal,
          taxAmount
        }];
      }
    });

    showToast(`✓ Scanned & Added: ${product.name}`);
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId || item.product.sku === productId) {
          // If current quantity is negative, we're in return mode, so max is -1. Otherwise min is 1.
          const isReturn = item.quantity < 0;
          const newQty = isReturn ? Math.min(-1, item.quantity + delta) : Math.max(1, item.quantity + delta);
          const subtotal = newQty * item.unitPrice;
          const taxRate = item.product.taxRate || 0;
          const taxAmount = (subtotal * taxRate) / 100;
          return { ...item, quantity: newQty, subtotal, taxAmount };
        }
        return item;
      });
    });
  };

  const setCartQtyDirect = (productId: string, qty: number) => {
    if (qty === 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId || item.product.sku === productId) {
          const subtotal = qty * item.unitPrice;
          const taxRate = item.product.taxRate || 0;
          const taxAmount = (subtotal * taxRate) / 100;
          return { ...item, quantity: qty, subtotal, taxAmount };
        }
        return item;
      });
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId && item.product.sku !== productId));
    showToast('Item removed from bill');
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
  };

  const holdCurrentBill = (note?: string) => {
    if (cart.length === 0) return;
    const newHold: HeldBill = {
      id: `hold-${Date.now().toString().slice(-4)}`,
      heldAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      customerName: selectedCustomer ? selectedCustomer.name : 'Walk-in',
      customerMobile: selectedCustomer ? selectedCustomer.mobile : '-',
      items: [...cart],
      note: note || 'Shift Hold'
    };
    setHeldBills(prev => [newHold, ...prev]);
    clearCart();
    showToast(`⏸ Bill held #${newHold.id}`);
  };

  const restoreHeldBill = (heldBillId: string) => {
    const target = heldBills.find(h => h.id === heldBillId);
    if (target) {
      setCart(target.items);
      setHeldBills(prev => prev.filter(h => h.id !== heldBillId));
      showToast(`▶ Restored held bill #${heldBillId}`);
    }
  };

  const deleteHeldBill = (heldBillId: string) => {
    setHeldBills(prev => prev.filter(h => h.id !== heldBillId));
    showToast('Held bill deleted');
  };

  // Process Checkout & Save in MongoDB
  const processCheckout = async (payments: PaymentDetails[], pointsRedeemed: number = 0): Promise<Order | null> => {
    try {
      const subtotal = cart.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
      const taxTotal = cart.reduce((acc, item) => acc + item.taxAmount, 0);
      const discountTotal = cart.reduce((acc, item) => {
        const regularSub = item.quantity * item.unitPrice;
        return acc + (regularSub - item.subtotal);
      }, 0);
      const grandTotal = Math.round(subtotal - discountTotal + taxTotal - pointsRedeemed);

      const payload = {
        items: cart.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          sku: item.product.sku,
          barcode: item.product.barcode,
          quantity: item.quantity,
          price: item.unitPrice,
          purchasePrice: item.product.purchasePrice,
          mrp: item.product.mrp,
          total: item.subtotal
        })),
        subtotal,
        discount: discountTotal + pointsRedeemed, // Points acted as discount
        tax: taxTotal,
        grandTotal,
        paymentMethod: payments[0]?.method || 'CASH',
        amountReceived: payments[0]?.tendered || grandTotal,
        change: payments[0]?.changeReturned || 0,
        employeeId: selectedEmployee?._id || undefined,
        employeeName: selectedEmployee?.name || 'Admin',
        cashierId: selectedEmployee?._id || undefined,
        cashierName: selectedEmployee?.name || 'Admin',
        customerId: selectedCustomer?.id || null,
        customerName: selectedCustomer?.name || 'Walk-in',
        customerMobile: selectedCustomer?.mobile || '-',
        pointsRedeemed,
        shiftId: activeShift.id
      };

      // Call Backend API to store Bill & atomically decrement stock in MongoDB
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();

      if (!json.success) {
        window.alert(`❌ Checkout Error:\n${json.error}`);
        return null;
      }

      const createdBill = json.data;

      const newOrder: Order = {
        id: createdBill._id,
        billNumber: createdBill.billNumber,
        createdAt: createdBill.createdAt,
        employeeName: selectedEmployee?.name || 'Admin',
        employeeId: selectedEmployee?._id || 'admin-01',
        customerName: selectedCustomer ? selectedCustomer.name : 'Valued Shopper',
        customerMobile: selectedCustomer ? selectedCustomer.mobile : 'Walk-in',
        items: [...cart],
        subtotal,
        taxTotal,
        discountTotal,
        totalMRP: cart.reduce((acc, i) => acc + (i.quantity * i.product.mrp), 0),
        totalSavings: 0,
        grandTotal,
        payments,
        status: 'COMPLETED',
        shiftId: activeShift.id
      };

      // Refresh database state
      await fetchProducts();
      await fetchDashboardStats();
      await fetchStockHistory();
      // await fetchBills(); // Sales history will be fetched when needed

      clearCart();
      // setReceiptOrder(newOrder); // Removed to prevent browser print preview
      showToast(`🎉 Bill ${createdBill.billNumber} saved! Stock updated.`);
      return newOrder;
    } catch (err: any) {
      console.error('processCheckout error:', err);
      showToast(`❌ Checkout Failed: ${err.message}`);
      return null;
    }
  };

  // Cancel Bill in MongoDB and restore stock
  const cancelBillInDb = async (billId: string) => {
    try {
      const res = await fetch(`/api/sales/${billId}/cancel`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        showToast(`✓ Invoice cancelled & stock restored`);
        await fetchProducts();
        await fetchDashboardStats();
        await fetchStockHistory();
        await fetchBills();
      } else {
        showToast(`❌ Cancellation failed: ${json.error}`);
      }
    } catch (e: any) {
      showToast(`❌ Cancellation failed: ${e.message}`);
    }
  };

  // Add Product & Handle Duplicate SKU Upsert (Requirement #3)
  const addProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productData.name,
          sku: productData.sku,
          barcode: productData.barcode,
          category: productData.category,
          unit: productData.unit,
          purchasePrice: productData.purchasePrice,
          sellingPrice: productData.sellingPrice,
          mrp: productData.mrp,
          quantity: productData.stockQuantity,
          minimumStock: productData.minimumStock,
          imageUrl: productData.imageUrl
        })
      });

      const json = await res.json();

      if (!json.success) {
        showToast(`❌ Error: ${json.error}`);
        return { message: json.error };
      }

      await fetchProducts();
      await fetchDashboardStats();
      await fetchStockHistory();

      if (json.isDuplicateSkuUpdate) {
        showToast(`🔄 ${json.message}`);
      } else {
        showToast(`✓ Product "${json.data.name}" added successfully.`);
      }

      return { isDuplicateSkuUpdate: json.isDuplicateSkuUpdate, message: json.message };
    } catch (err: any) {
      console.error('addProduct error:', err);
      showToast(`❌ Failed to save product: ${err.message}`);
      return { message: err.message };
    }
  };

  const updateProduct = async (id: string, updated: Partial<Product>) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: updated.name,
          sku: updated.sku,
          barcode: updated.barcode,
          category: updated.category,
          unit: updated.unit,
          purchasePrice: updated.purchasePrice,
          sellingPrice: updated.sellingPrice,
          mrp: updated.mrp,
          quantity: updated.stockQuantity,
          minimumStock: updated.minimumStock
        })
      });
      const json = await res.json();
      if (json.success) {
        showToast(`✓ Product updated successfully`);
        await fetchProducts();
        await fetchDashboardStats();
        await fetchStockHistory();
      } else {
        showToast(`❌ Update failed: ${json.error}`);
      }
    } catch (e: any) {
      showToast(`❌ Update failed: ${e.message}`);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showToast(`✓ Product disabled successfully`);
        await fetchProducts();
        await fetchDashboardStats();
      } else {
        showToast(`❌ Delete failed: ${json.error}`);
      }
    } catch (e: any) {
      showToast(`❌ Delete failed: ${e.message}`);
    }
  };

  // Adjust Stock directly in MongoDB
  const adjustStock = async (id: string, adjustmentType: string, quantity: number, reason: string = 'Stock Addition', batchNumber?: string, expiryDate?: string) => {
    try {
      const res = await fetch('/api/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id, adjustmentType, quantity, reason, batchNumber, expiryDate })
      });
      const json = await res.json();
      if (json.success) {
        showToast(`✓ ${json.message}`);
        await fetchProducts();
        await fetchDashboardStats();
        await fetchStockHistory();
      } else {
        showToast(`❌ Stock adjust failed: ${json.error}`);
      }
    } catch (e: any) {
      showToast(`❌ Stock adjust error: ${e.message}`);
    }
  };

  const addCustomer = (customerData: Omit<Customer, 'id'>): Customer => {
    const newCust: Customer = {
      ...customerData,
      id: `cust-${Date.now().toString().slice(-4)}`
    };
    setCustomers(prev => [newCust, ...prev]);
    showToast(`Member ${newCust.name} registered (+100 pts)`);
    return newCust;
  };

  const addSupplier = (supplierData: Omit<Supplier, 'id' | 'pendingOrdersCount' | 'totalBalance'>) => {
    const newSupp: Supplier = {
      ...supplierData,
      id: `supp-${Date.now().toString().slice(-4)}`,
      pendingOrdersCount: 0,
      totalBalance: 0
    };
    setSuppliers(prev => [newSupp, ...prev]);
    showToast(`Supplier ${newSupp.name} registered`);
  };

  const closeCurrentShift = async (physicalCashInDrawer?: number) => {
    if (!activeShift.id) return;
    try {
      const res = await fetch(`/api/shifts/${activeShift.id}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ physicalCashInDrawer: physicalCashInDrawer || 0 })
      });
      const data = await res.json();
      if (data.success) {
        setActiveShift(prev => ({ ...prev, status: 'CLOSED' }));
        showToast('🔒 Shift closed successfully. Z-Report generated.');
      } else {
        showToast(`Failed to close shift: ${data.error}`);
      }
    } catch (err) {
      showToast('Error closing shift');
    }
  };

  const openShift = async (openingFloat: number) => {
    try {
      const res = await fetch('/api/shifts/current', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          openingFloat, 
          cashierName: activeUser?.name || 'Unknown', 
          cashierId: activeUser?.id || 'usr-00', 
          counterId: activeUser?.counterId || 'COUNTER-01' 
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        await fetchShift();
        showToast('🔓 Shift opened successfully.');
      } else {
        showToast(`Failed to open shift: ${data.error}`);
      }
    } catch (err) {
      showToast('Error opening shift');
    }
  };

  return (
    <POSContext.Provider
      value={{
        employees,
    selectedEmployee,
    setSelectedEmployee,
    products,
        isLoadingProducts,
        cart,
        setCart,
        orders,
        heldBills,
        customers,
        suppliers,
        activeUser,
        loginUser,
        logoutUser,
        activeShift,
        selectedCustomer,
        setSelectedCustomer,
        dashboardStats,
        stockHistoryLogs,
        fetchProducts,
        fetchDashboardStats,
        fetchStockHistory,
        lookupProductByBarcodeOrSku,
        addToCart,
        updateCartQty,
        setCartQtyDirect,
        removeFromCart,
        clearCart,
        holdCurrentBill,
        restoreHeldBill,
        deleteHeldBill,
        processCheckout,
        cancelBillInDb,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        addCustomer,
        addSupplier,
        closeCurrentShift,
        openShift,
        receiptOrder,
        setReceiptOrder,
        toastMessage,
        showToast
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within POSProvider');
  }
  return context;
};
