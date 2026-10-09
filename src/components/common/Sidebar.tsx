'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, ShoppingBag, Package, Users, Truck, FileBarChart, Clock, ShieldAlert, CheckCircle2,
  ShoppingCart, ReceiptText, Tags, DollarSign, BarChart3, Settings, ChevronDown, ChevronRight, Store, FileText
} from 'lucide-react';
import Image from 'next/image';
import ediptiLogo from '@/asset/images/ediptilogo.png';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>(['POS', 'Products']);

  const toggleMenu = (label: string) => {
    setOpenMenus(prev => prev.includes(label) ? prev.filter(m => m !== label) : [...prev, label]);
  };

  const navGroups = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    {
      label: 'POS', icon: ShoppingCart,
      children: [
        { label: 'New Sale', href: '/pos', isPos: true },
        { label: 'Hold Bills', href: '/admin/pos/hold-bills' },
        { label: 'Sales History', href: '/admin/sales' },
      ]
    },
    {
      label: 'Products', icon: Package,
      children: [
        { label: 'Products', href: '/admin/inventory' },
        { label: 'Categories', href: '/admin/categories' },
        { label: 'Sub Categories', href: '/admin/sub-categories' },
        { label: 'Brands', href: '/admin/brands' },
        { label: 'Units', href: '/admin/units' },
        { label: 'Print Barcode', href: '/admin/print-barcode' },
        { label: 'Print QR Code', href: '/admin/print-qrcode' },
        { label: 'Stock', href: '/admin/stock' },
        { label: 'Stock Adjustment', href: '/admin/stock-adjustment' },
      ]
    },
    {
      label: 'Sales', icon: ReceiptText,
      children: [
        { label: 'Sales', href: '/admin/sales' },
        { label: 'Invoices', href: '/admin/invoices' },
        { label: 'Sales Return', href: '/admin/sales-return' },
        { label: 'Payments', href: '/admin/payments' },
      ]
    },
    {
      label: 'Purchases', icon: ShoppingBag,
      children: [
        { label: 'New Purchase', href: '/admin/purchases/new' },
        { label: 'Purchase History', href: '/admin/purchases' },
        { label: 'Purchase Return', href: '/admin/purchase-return' },
      ]
    },
    {
      label: 'People', icon: Users,
      children: [
        { label: 'Customers', href: '/admin/customers' },
        { label: 'Billers', href: '/admin/billers' },
        { label: 'Suppliers', href: '/admin/suppliers' },
        { label: 'Warehouses', href: '/admin/warehouses' },
      ]
    },
    {
      label: 'Expenses', icon: DollarSign,
      children: [
        { label: 'Expenses', href: '/admin/expenses' },
        { label: 'Expense Categories', href: '/admin/expense-categories' },
      ]
    },
    {
      label: 'Reports', icon: BarChart3,
      children: [
        { label: 'Sales', href: '/admin/reports/sales' },
        { label: 'Purchase', href: '/admin/reports/purchase' },
        { label: 'Profit', href: '/admin/reports/profit' },
        { label: 'Stock', href: '/admin/reports/stock' },
        { label: 'Low Stock', href: '/admin/reports/low-stock' },
        { label: 'Returns', href: '/admin/reports/returns' },
        { label: 'Customer Due', href: '/admin/reports/customer-due' },
        { label: 'Supplier Due', href: '/admin/reports/supplier-due' },
        { label: 'Expenses', href: '/admin/reports/expenses' },
        { label: 'GST', href: '/admin/reports/gst' },
      ]
    },
    {
      label: 'Settings', icon: Settings,
      children: [
        { label: 'Shop', href: '/admin/settings/shop' },
        { label: 'Users & Roles', href: '/admin/staff-rbac' },
        { label: 'Invoice', href: '/admin/settings/invoice' },
        { label: 'Printer', href: '/admin/settings/printer' },
        { label: 'Payments', href: '/admin/settings/payments' },
        { label: 'Tax / GST', href: '/admin/settings/tax' },
        { label: 'Backup', href: '/admin/settings/backup' },
      ]
    },
  ];

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-theme-white border-r border-theme-gray-border z-40 flex flex-col justify-between">
      <div className="py-4 px-3 flex-1 overflow-y-auto">
        <nav className="flex flex-col gap-1.5">
          {navGroups.map((group, index) => {
            const Icon = group.icon;
            
            if (group.href) {
              const isActive = pathname === group.href;
              return (
                <Link
                  key={index}
                  href={group.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-theme-blue text-white shadow-sm font-bold'
                      : 'text-theme-gray-text hover:bg-theme-gray-light hover:text-theme-navy'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{group.label}</span>
                </Link>
              );
            }

            const isOpen = openMenus.includes(group.label);
            const hasActiveChild = group.children?.some(child => pathname === child.href);

            return (
              <div key={index} className="flex flex-col">
                <button
                  onClick={() => toggleMenu(group.label)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all w-full ${
                    hasActiveChild && !isOpen
                      ? 'text-theme-blue bg-blue-50/50'
                      : 'text-theme-gray-text hover:bg-theme-gray-light hover:text-theme-navy'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${hasActiveChild && !isOpen ? 'text-theme-blue' : 'text-slate-400'}`} />
                    <span>{group.label}</span>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                
                {isOpen && (
                  <div className="flex flex-col gap-1 pl-11 pr-2 mt-1 mb-2 border-l-2 border-slate-100 ml-5">
                    {group.children?.map((child, childIdx) => {
                      const isChildActive = pathname === child.href;
                      return (
                        <Link
                          key={childIdx}
                          href={child.href}
                          className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                            isChildActive
                              ? 'bg-theme-teal/10 text-theme-teal font-bold'
                              : (child as any).isPos
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                          }`}
                        >
                          {(child as any).isPos && <ShoppingCart className="w-3.5 h-3.5" />}
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Edipti Footer */}
      <div className="p-2 border-t border-theme-gray-border shrink-0 bg-white">
        <Link href="#" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 flex items-center justify-center border border-slate-100">
            <Image src={ediptiLogo} alt="edipti" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-theme-navy text-base tracking-wide">edipti</span>
        </Link>
      </div>
    </aside>
  );
};
