export type Role = 'OWNER' | 'ADMIN' | 'CASHIER';

export type Category = 
  | 'Groceries & Staples'
  | 'Dairy & Bakery'
  | 'Beverages & Juices'
  | 'Snacks & Packaged Food'
  | 'Personal Care & Hygiene'
  | 'Household Cleaning'
  | 'Biscuits'
  | string;

export interface ProductBatch {
  batchNumber: string;
  expiryDate: string;
  qty: number;
}

export interface Product {
  id: string;
  barcode: string;
  sku: string;
  name: string;
  category: string;
  subcategory?: string;
  brand?: string;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  pricePerKg?: number;
  mrp: number; // Maximum Retail Price for D-Mart style discount display
  taxRate: number; // GST % e.g., 5, 12, 18
  stockQuantity: number;
  minimumStock: number;
  imageUrl?: string;
  isActive: boolean;
  expiryTracking?: boolean;
  batchTracking?: boolean;
  batches?: ProductBatch[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  discountPercent: number;
  unitPrice: number;
  subtotal: number;
  taxAmount: number;
}

export type PaymentMethod = 'CASH' | 'CARD' | 'UPI' | 'SPLIT' | 'CREDIT';

export interface PaymentDetails {
  method: PaymentMethod;
  amount: number;
  tendered?: number;
  changeReturned?: number;
  referenceId?: string; // UPI txn ID or Card Auth Code
}

export interface Order {
  id: string;
  billNumber: string; // e.g. INV-2025-0842
  createdAt: string;
  employeeId?: string;
  employeeName?: string;
  customerId?: string;
  customerName?: string;
  customerMobile: string;
  items: CartItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  totalMRP: number;
  totalSavings: number; // D-Mart style "You Saved ₹180 today!"
  pointsEarned?: number;
  grandTotal: number;
  payments: PaymentDetails[];
  status: 'COMPLETED' | 'HOLD' | 'VOIDED' | 'RETURNED';
  shiftId: string;
}

export interface HeldBill {
  id: string;
  heldAt: string;
  customerName: string;
  customerMobile: string;
  items: CartItem[];
  note?: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  points: number;
  outstanding?: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  gstin: string;
  categories: Category[];
  pendingOrdersCount: number;
  totalBalance: number;
}

export interface ShiftInfo {
  id: string;
  shiftStart: string;
  cashierName: string;
  counterId: string;
  openingFloat: number;
  cashSales: number;
  cardSales: number;
  upiSales: number;
  totalSales: number;
  status: 'OPEN' | 'CLOSED';
}

export interface UserUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  counterId: string;
  isActive: boolean;
  avatarUrl?: string;
}
