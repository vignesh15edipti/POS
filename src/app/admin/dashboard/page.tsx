'use client';

import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  FileText, RefreshCcw, ShoppingCart, ShoppingBag, 
  TrendingUp, FileWarning, DollarSign, CreditCard,
  ChevronDown, Package, Users, IndianRupee, Calendar, BarChart3
} from 'lucide-react';

export default function AdminDashboardPage() {
  // -------------------------------------------------------------
  // Filter States
  // -------------------------------------------------------------
  const [spFilter, setSpFilter] = useState('1W');
  const [customersFilter, setCustomersFilter] = useState('Today');
  const [topSellingFilter, setTopSellingFilter] = useState('Today');
  const [recentSalesFilter, setRecentSalesFilter] = useState('Weekly');
  const [salesStaticsFilter, setSalesStaticsFilter] = useState('2026');
  const [topCatFilter, setTopCatFilter] = useState('Weekly');
  const [orderStatFilter, setOrderStatFilter] = useState('Weekly');

  // Helper to get a multiplier for mocking data changes based on time filter
  const getMultiplier = (filter: string) => {
    switch (filter) {
      case '1D':
      case 'Today': return 0.15;
      case '1W':
      case 'Weekly': return 1;
      case '1M':
      case 'Monthly': return 4.2;
      case '3M': return 12.5;
      case '6M': return 25;
      case '1Y':
      case 'Yearly': return 50;
      case '2025': return 0.85;
      case '2024': return 0.7;
      default: return 1;
    }
  };

  // Reusable Dropdown Component
  const DropdownFilter = ({ value, options, onChange }: { value: string, options: string[], onChange: (v: string) => void }) => {
    const [open, setOpen] = useState(false);
    return (
      <div className="relative">
        <button 
          onClick={() => setOpen(!open)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          className="text-[10px] flex items-center gap-1 border border-slate-200 px-2 py-1 rounded text-slate-500 hover:bg-slate-50 transition-colors bg-white z-10"
        >
          {value} <ChevronDown size={12} />
        </button>
        {open && (
          <div className="absolute right-0 mt-1 bg-white border border-slate-200 rounded shadow-md z-20 min-w-[80px] overflow-hidden">
            {options.map(opt => (
              <div 
                key={opt} 
                className="px-3 py-1.5 text-[10px] cursor-pointer hover:bg-slate-50 hover:text-orange-500 font-medium transition-colors"
                onClick={() => { onChange(opt); setOpen(false); }}
              >
                {opt}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // -------------------------------------------------------------
  // NEW DUMMY DATA GENERATORS (Fully working & populated)
  // -------------------------------------------------------------
  
  // Dashboard Static Metrics
  const dashMetrics = {
    totalSales: 12458900,
    totalProducts: 450,
    totalQty: 12845,
    totalInventoryValue: 5684500,
    totalPurchaseReturn: 245000,
    profit: 2845900,
    invoiceDue: 450000,
    totalExpenses: 890500,
    totalPaymentReturns: 125000
  };

  const spMult = getMultiplier(spFilter);
  const salesPurchaseData = [
    { name: '2 am', purchase: Math.round(35 * spMult), sales: Math.round(18 * spMult) },
    { name: '4 am', purchase: Math.round(22 * spMult), sales: Math.round(15 * spMult) },
    { name: '6 am', purchase: Math.round(50 * spMult), sales: Math.round(28 * spMult) },
    { name: '8 am', purchase: Math.round(65 * spMult), sales: Math.round(45 * spMult) },
    { name: '10 am', purchase: Math.round(80 * spMult), sales: Math.round(62 * spMult) },
    { name: '12 pm', purchase: Math.round(45 * spMult), sales: Math.round(30 * spMult) },
    { name: '14 pm', purchase: Math.round(55 * spMult), sales: Math.round(40 * spMult) },
    { name: '16 pm', purchase: Math.round(90 * spMult), sales: Math.round(75 * spMult) },
    { name: '18 pm', purchase: Math.round(85 * spMult), sales: Math.round(65 * spMult) },
    { name: '20 pm', purchase: Math.round(60 * spMult), sales: Math.round(45 * spMult) },
    { name: '22 pm', purchase: Math.round(40 * spMult), sales: Math.round(25 * spMult) },
    { name: '24 pm', purchase: Math.round(30 * spMult), sales: Math.round(15 * spMult) },
  ];

  const custMult = getMultiplier(customersFilter);
  const customersOverviewData = [
    { name: 'First Time', value: Math.round(65 * custMult), color: '#14B8A6' },
    { name: 'Return', value: Math.round(35 * custMult), color: '#F97316' }
  ];

  const statMult = getMultiplier(salesStaticsFilter);
  const salesStaticsData = [
    { name: 'JAN', revenue: Math.round(25 * statMult), expenses: Math.round(-12 * statMult) },
    { name: 'FEB', revenue: Math.round(28 * statMult), expenses: Math.round(-15 * statMult) },
    { name: 'MAR', revenue: Math.round(32 * statMult), expenses: Math.round(-18 * statMult) },
    { name: 'APR', revenue: Math.round(45 * statMult), expenses: Math.round(-20 * statMult) },
    { name: 'MAY', revenue: Math.round(40 * statMult), expenses: Math.round(-22 * statMult) },
    { name: 'JUN', revenue: Math.round(55 * statMult), expenses: Math.round(-25 * statMult) },
    { name: 'JUL', revenue: Math.round(60 * statMult), expenses: Math.round(-28 * statMult) },
    { name: 'AUG', revenue: Math.round(58 * statMult), expenses: Math.round(-26 * statMult) },
    { name: 'SEP', revenue: Math.round(52 * statMult), expenses: Math.round(-24 * statMult) },
    { name: 'OCT', revenue: Math.round(68 * statMult), expenses: Math.round(-30 * statMult) },
    { name: 'NOV', revenue: Math.round(75 * statMult), expenses: Math.round(-35 * statMult) },
    { name: 'DEC', revenue: Math.round(95 * statMult), expenses: Math.round(-40 * statMult) },
  ];

  const catMult = getMultiplier(topCatFilter);
  const topCategoriesData = [
    { name: 'Groceries', value: Math.round(1250 * catMult), color: '#1E3A8A' },
    { name: 'Beverages', value: Math.round(850 * catMult), color: '#F97316' },
    { name: 'Snacks', value: Math.round(620 * catMult), color: '#38BDF8' }
  ];

  const tsMult = getMultiplier(topSellingFilter);
  const topSellingProducts = [
    { name: 'Premium Jasmine Rice (5kg)', price: Math.round(850 * tsMult), sales: Math.round(456 * tsMult), img: 'bg-orange-100', progress: '+18%' },
    { name: 'Organic Almonds (500g)', price: Math.round(650 * tsMult), sales: Math.round(389 * tsMult), img: 'bg-red-100', progress: '+12%' },
    { name: 'Whole Wheat Bread', price: Math.round(55 * tsMult), sales: Math.round(680 * tsMult), img: 'bg-green-100', progress: '+25%' },
    { name: 'Fresh Farm Eggs (Dozen)', price: Math.round(120 * tsMult), sales: Math.round(540 * tsMult), img: 'bg-blue-100', progress: '-5%', neg: true },
    { name: 'Cold Pressed Olive Oil (1L)', price: Math.round(1250 * tsMult), sales: Math.round(210 * tsMult), img: 'bg-indigo-100', progress: '+8%' },
  ];

  const recentMult = getMultiplier(recentSalesFilter);
  const recentSales = [
    { name: 'Weekly Groceries Run', cat: 'Groceries', id: 'INV-8091', date: 'Today, 10:45 AM', status: 'Completed', color: 'bg-teal-500', img: 'bg-green-600' },
    { name: 'Snacks & Beverages', cat: 'Mix', id: 'INV-8090', date: 'Today, 09:20 AM', status: 'Processing', color: 'bg-indigo-500', img: 'bg-blue-500' },
    { name: 'Fresh Vegetables Pack', cat: 'Produce', id: 'INV-8089', date: 'Yesterday', status: 'Completed', color: 'bg-teal-500', img: 'bg-orange-400' },
    { name: 'Monthly Supplies', cat: 'Groceries', id: 'INV-8088', date: 'Yesterday', status: 'On Hold', color: 'bg-yellow-500', img: 'bg-slate-700' },
    { name: 'Dairy & Eggs', cat: 'Dairy', id: 'INV-8087', date: '2 Days Ago', status: 'Rejected', color: 'bg-red-500', img: 'bg-red-400' },
  ];

  const lowStockProducts = [
    { name: 'Premium Sunflower Oil', id: 'SKU-7741', stock: 4, img: 'bg-yellow-500' },
    { name: 'Organic Honey (250g)', id: 'SKU-8812', stock: 2, img: 'bg-orange-600' },
    { name: 'Roasted Coffee Beans', id: 'SKU-9904', stock: 6, img: 'bg-slate-800' },
    { name: 'Green Tea Bags (50s)', id: 'SKU-1123', stock: 8, img: 'bg-green-600' },
    { name: 'Dark Chocolate 70%', id: 'SKU-4456', stock: 5, img: 'bg-purple-800' },
  ];

  const recentTransactions = [
    { name: 'Arun Kumar', id: '#CUST-001', date: 'Today', status: 'Completed', total: '₹4,850', color: 'bg-teal-500' },
    { name: 'Priya Sharma', id: '#CUST-002', date: 'Today', status: 'Completed', total: '₹1,240', color: 'bg-teal-500' },
    { name: 'Vikram Singh', id: '#CUST-003', date: 'Yesterday', status: 'Failed', total: '₹8,900', color: 'bg-pink-500' },
    { name: 'Neha Gupta', id: '#CUST-004', date: 'Yesterday', status: 'Completed', total: '₹3,450', color: 'bg-teal-500' },
    { name: 'Rahul Desai', id: '#CUST-005', date: '2 Days Ago', status: 'Completed', total: '₹12,400', color: 'bg-teal-500' },
  ];

  // Specific user request: "add 3 shoper data" (Top 3 Shoppers/Customers)
  const topCustomers = [
    { name: 'Arun Kumar', loc: 'Delhi, IN', orders: Math.round(145 * custMult), total: '₹' + Math.round(248500 * custMult).toLocaleString('en-IN'), img: 'bg-blue-500' },
    { name: 'Neha Gupta', loc: 'Mumbai, IN', orders: Math.round(112 * custMult), total: '₹' + Math.round(185400 * custMult).toLocaleString('en-IN'), img: 'bg-pink-500' },
    { name: 'Rahul Desai', loc: 'Bangalore, IN', orders: Math.round(98 * custMult), total: '₹' + Math.round(142000 * custMult).toLocaleString('en-IN'), img: 'bg-orange-500' }
  ];

  const formatINR = (value: number) => {
    return '₹' + (value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  return (
    <div className="space-y-6 bg-[#F8F9FA40] min-h-screen pb-10 text-slate-800 font-sans">
      
      {/* Welcome Admin Row */}
      <div className="pt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            Welcome, Admin <span className="text-lg"></span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Here is what's happening with your store today.</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
          <Calendar size={18} className="text-slate-400" />
          <span className="text-sm font-medium text-slate-600">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Top Banner */}
      <div className="bg-red-50 text-red-500 px-4 py-2 rounded-lg text-xs font-medium flex justify-between items-center border border-red-100">
        <p>⚠️ Your Product <span className="font-bold">Premium Sunflower Oil is running Low</span>, already below 5 Pcs. <a href="#" className="underline font-bold text-red-600">Add Stock</a></p>
        <button className="text-red-400 hover:text-red-600">✕</button>
      </div>

      {/* 8 Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Row 1 */}
        <div className="bg-[#F97316] rounded-xl p-5 text-white flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium opacity-90 mb-1">Total Sale</p>
            <h3 className="text-xl font-bold">{formatINR(dashMetrics.totalSales)}</h3>
            <span className="inline-block bg-white text-[#F97316] text-[10px] px-2 py-0.5 rounded-full mt-2 font-bold">+14%</span>
          </div>
          <div className="bg-white/20 p-3 rounded-xl">
            <IndianRupee size={24} className="text-white" />
          </div>
        </div>

        <div className="bg-[#1E3A8A] rounded-xl p-5 text-white flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium opacity-90 mb-1">Total Products & Units</p>
            <h3 className="text-xl font-bold">{dashMetrics.totalProducts} / {dashMetrics.totalQty.toLocaleString('en-IN')}</h3>
            <span className="inline-block bg-white text-[#1E3A8A] text-[10px] px-2 py-0.5 rounded-full mt-2 font-bold">Active SKUs</span>
          </div>
          <div className="bg-white/20 p-3 rounded-xl">
            <Package size={24} className="text-white" />
          </div>
        </div>

        <div className="bg-[#14B8A6] rounded-xl p-5 text-white flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium opacity-90 mb-1">Total Inventory Value</p>
            <h3 className="text-xl font-bold">{formatINR(dashMetrics.totalInventoryValue)}</h3>
            <span className="inline-block bg-white text-[#14B8A6] text-[10px] px-2 py-0.5 rounded-full mt-2 font-bold">Cost Value</span>
          </div>
          <div className="bg-white/20 p-3 rounded-xl">
            <ShoppingCart size={24} className="text-white" />
          </div>
        </div>

        <div className="bg-[#3B82F6] rounded-xl p-5 text-white flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium opacity-90 mb-1">Total Purchase Return</p>
            <h3 className="text-xl font-bold">{formatINR(dashMetrics.totalPurchaseReturn)}</h3>
            <span className="inline-block bg-white text-[#3B82F6] text-[10px] px-2 py-0.5 rounded-full mt-2 font-bold">-2%</span>
          </div>
          <div className="bg-white/20 p-3 rounded-xl">
            <ShoppingBag size={24} className="text-white" />
          </div>
        </div>

        {/* Row 2 */}
        <div className="bg-white rounded-xl p-5 flex flex-col justify-between shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-slate-800">{formatINR(dashMetrics.profit)}</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">Profit</p>
            </div>
            <div className="bg-emerald-50 p-2 rounded-lg text-emerald-500">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="flex justify-between items-center mt-4 text-[10px]">
            <span className="text-emerald-500 font-bold">+28% <span className="text-slate-400 font-medium">vs Last Month</span></span>
            <span className="text-slate-400 font-medium hover:text-slate-600 underline cursor-pointer">View All</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 flex flex-col justify-between shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-slate-800">{formatINR(dashMetrics.invoiceDue)}</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">Invoice Due</p>
            </div>
            <div className="bg-orange-50 p-2 rounded-lg text-orange-500">
              <FileWarning size={18} />
            </div>
          </div>
          <div className="flex justify-between items-center mt-4 text-[10px]">
            <span className="text-red-500 font-bold">+12% <span className="text-slate-400 font-medium">vs Last Month</span></span>
            <span className="text-slate-400 font-medium hover:text-slate-600 underline cursor-pointer">View All</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 flex flex-col justify-between shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-slate-800">{formatINR(dashMetrics.totalExpenses)}</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">Total Expenses</p>
            </div>
            <div className="bg-pink-50 p-2 rounded-lg text-pink-500">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="flex justify-between items-center mt-4 text-[10px]">
            <span className="text-red-500 font-bold">+5% <span className="text-slate-400 font-medium">vs Last Month</span></span>
            <span className="text-slate-400 font-medium hover:text-slate-600 underline cursor-pointer">View All</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 flex flex-col justify-between shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-slate-800">{formatINR(dashMetrics.totalPaymentReturns)}</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">Total Payment Returns</p>
            </div>
            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-500">
              <CreditCard size={18} />
            </div>
          </div>
          <div className="flex justify-between items-center mt-4 text-[10px]">
            <span className="text-emerald-500 font-bold">-18% <span className="text-slate-400 font-medium">vs Last Month</span></span>
            <span className="text-slate-400 font-medium hover:text-slate-600 underline cursor-pointer">View All</span>
          </div>
        </div>
      </div>

      {/* Section 2: Sales & Purchase / Overall Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales & Purchase */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold flex items-center gap-2 text-sm"><span className="text-orange-500 bg-orange-50 p-1.5 rounded-lg"><BarChart3 size={16} /></span> Sales & Purchase</h3>
            <div className="flex bg-slate-50 p-0.5 rounded-md border border-slate-100">
              {['1D', '1W', '1M', '3M', '6M', '1Y'].map(filter => (
                <button 
                  key={filter} 
                  onClick={() => setSpFilter(filter)}
                  className={`text-[10px] px-3 py-1 rounded font-bold transition-all ${spFilter === filter ? 'bg-orange-400 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-6 mb-4 text-xs">
            <div>
              <p className="text-slate-400 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#FED7AA]"></span> Total Purchase</p>
              <p className="font-bold text-lg mt-0.5">{Math.round(45 * spMult)}K</p>
            </div>
            <div>
              <p className="text-slate-400 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#F97316]"></span> Total Sales</p>
              <p className="font-bold text-lg mt-0.5">{Math.round(85 * spMult)}K</p>
            </div>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesPurchaseData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} tickFormatter={(val) => val + 'K'} />
                <RechartsTooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="purchase" fill="#FED7AA" radius={[4, 4, 0, 0]} barSize={10} />
                <Bar dataKey="sales" fill="#FB923C" radius={[4, 4, 0, 0]} barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Overall Information */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold flex items-center gap-2 text-sm"><span className="text-blue-500 bg-blue-50 p-1.5 rounded-lg"><Users size={16} /></span> Overall Information</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="text-center p-3 border border-slate-100 rounded-xl hover:border-blue-200 transition-colors">
              <div className="text-blue-500 flex justify-center mb-2"><Users size={18} /></div>
              <p className="text-[10px] text-slate-500 font-medium">Suppliers</p>
              <p className="font-bold text-sm">124</p>
            </div>
            <div className="text-center p-3 border border-slate-100 rounded-xl hover:border-orange-200 transition-colors">
              <div className="text-orange-500 flex justify-center mb-2"><Users size={18} /></div>
              <p className="text-[10px] text-slate-500 font-medium">Customer</p>
              <p className="font-bold text-sm">4,582</p>
            </div>
            <div className="text-center p-3 border border-slate-100 rounded-xl bg-teal-50 hover:border-teal-200 transition-colors">
              <div className="text-teal-500 flex justify-center mb-2"><ShoppingCart size={18} /></div>
              <p className="text-[10px] text-teal-600 font-medium">Orders</p>
              <p className="font-bold text-sm text-teal-700">8,950</p>
            </div>
          </div>

          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-xs">Customers Overview</h4>
            <DropdownFilter value={customersFilter} options={['Today', 'Weekly', 'Monthly', 'Yearly']} onChange={setCustomersFilter} />
          </div>

          <div className="flex items-center justify-between flex-1">
            <div className="w-28 h-28 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={customersOverviewData}
                    innerRadius={35}
                    outerRadius={50}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                  >
                    {customersOverviewData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-slate-500 flex items-center gap-1.5 mb-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-teal-500"></span> First Time
                </p>
                <div className="flex items-center gap-2 ml-3.5">
                  <p className="font-bold text-sm">{(6.5 * custMult).toFixed(1)}K</p>
                  <span className="text-[9px] bg-teal-50 text-teal-600 px-1.5 py-0.5 rounded font-bold">+18%</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 flex items-center gap-1.5 mb-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span> Return
                </p>
                <div className="flex items-center gap-2 ml-3.5">
                  <p className="font-bold text-sm">{(3.5 * custMult).toFixed(1)}K</p>
                  <span className="text-[9px] bg-teal-50 text-teal-600 px-1.5 py-0.5 rounded font-bold">+22%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Top Selling Products & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Selling Products */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold flex items-center gap-2 text-sm"><span className="text-pink-500 bg-pink-50 p-1.5 rounded-lg"><TrendingUp size={16} /></span> Top Selling Products</h3>
            <DropdownFilter value={topSellingFilter} options={['Today', 'Weekly', 'Monthly']} onChange={setTopSellingFilter} />
          </div>
          <div className="space-y-4">
            {topSellingProducts.map((product, idx) => (
              <div key={idx} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white opacity-90 shadow-sm ${product.img}`}>
                    {product.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-800 group-hover:text-orange-500 transition-colors">{product.name}</h4>
                    <p className="text-[10px] text-slate-500">₹{product.price} • {product.sales}+ Sales</p>
                  </div>
                </div>
                <div className={`text-[10px] font-bold px-2 py-1 rounded-md ${product.neg ? 'text-red-500 border border-red-200' : 'text-emerald-500 border border-emerald-200'}`}>
                  {product.progress}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold flex items-center gap-2 text-sm"><span className="text-red-500 bg-red-50 p-1.5 rounded-lg"><FileWarning size={16} /></span> Low Stock Products</h3>
            <button className="text-[10px] text-slate-500 font-medium hover:text-slate-800 underline">View All</button>
          </div>
          <div className="space-y-4">
            {lowStockProducts.map((product, idx) => (
              <div key={idx} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white opacity-90 shadow-sm ${product.img}`}>
                    {product.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-800 group-hover:text-red-500 transition-colors">{product.name}</h4>
                    <p className="text-[10px] text-slate-500">ID : {product.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500">Instock</p>
                  <p className={`font-bold text-xs ${product.stock < 15 ? 'text-red-500' : 'text-orange-500'}`}>
                    {product.stock.toString().padStart(2, '0')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 4: Recent Sales */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold flex items-center gap-2 text-sm"><span className="text-pink-500 bg-pink-50 p-1.5 rounded-lg"><TrendingUp size={16} /></span> Recent Sales</h3>
          <DropdownFilter value={recentSalesFilter} options={['Today', 'Weekly', 'Monthly']} onChange={setRecentSalesFilter} />
        </div>
        <div className="space-y-4">
          {recentSales.map((sale: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0 last:pb-0 hover:bg-slate-50 transition-colors rounded-lg px-2 -mx-2">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white opacity-90 shadow-sm ${sale.img}`}>
                  {sale.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-800">{sale.name}</h4>
                  <p className="text-[10px] text-slate-500">{sale.cat} • {sale.id}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-600 mb-1 font-medium">{sale.date}</p>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded text-white shadow-sm ${sale.color}`}>
                  {sale.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 5: Sales Statics & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sales Statics */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold flex items-center gap-2 text-sm"><span className="text-red-500 bg-red-50 p-1.5 rounded-lg"><TrendingUp size={16} /></span> Sales Statics</h3>
            <DropdownFilter value={salesStaticsFilter} options={['2026', '2025', '2024']} onChange={setSalesStaticsFilter} />
          </div>
          
          <div className="flex gap-6 mb-6">
            <div>
              <p className="font-bold text-sm text-teal-500 flex items-center gap-2">₹{Math.round(482189 * statMult).toLocaleString()} <span className="text-[9px] bg-teal-500 text-white px-1 py-0.5 rounded">+42%</span></p>
              <p className="text-[10px] text-slate-400 mt-1">Revenue</p>
            </div>
            <div>
              <p className="font-bold text-sm text-red-500 flex items-center gap-2">₹{Math.round(189880 * statMult).toLocaleString()} <span className="text-[9px] bg-red-500 text-white px-1 py-0.5 rounded">-12%</span></p>
              <p className="text-[10px] text-slate-400 mt-1">Expenses</p>
            </div>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesStaticsData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94A3B8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94A3B8' }} tickFormatter={(val) => val + 'K'} />
                <RechartsTooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="revenue" fill="#14B8A6" radius={[4, 4, 4, 4]} barSize={6} />
                <Bar dataKey="expenses" fill="#F97316" radius={[4, 4, 4, 4]} barSize={6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold flex items-center gap-2 text-sm"><span className="text-orange-500 bg-orange-50 p-1.5 rounded-lg"><FileText size={16} /></span> Recent Transactions</h3>
            <button className="text-[10px] text-slate-500 font-medium hover:text-slate-800 underline">View All</button>
          </div>
          
          <div className="flex gap-4 border-b border-slate-100 mb-4 text-[11px] font-medium text-slate-500">
            <button className="text-orange-500 border-b-2 border-orange-500 pb-2">Sale</button>
            <button className="pb-2 hover:text-slate-800">Purchase</button>
            <button className="pb-2 hover:text-slate-800">Quotation</button>
            <button className="pb-2 hover:text-slate-800">Expenses</button>
            <button className="pb-2 hover:text-slate-800">Invoices</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="text-slate-400 font-medium">
                <tr>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium text-center">Status</th>
                  <th className="pb-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="text-slate-800">
                {recentTransactions.map((trx, idx) => (
                  <tr key={idx} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 text-slate-500">{trx.date}</td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 shrink-0 overflow-hidden shadow-sm flex items-center justify-center font-bold text-[9px] text-slate-500">
                           {trx.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-700">{trx.name}</p>
                          <p className="text-[9px] text-slate-400">{trx.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 text-center">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded text-white shadow-sm ${trx.color}`}>
                        {trx.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-bold text-slate-700">{trx.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Section 6: Top Customers & Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Customers (Requested exactly 3 Shoper data) */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold flex items-center gap-2 text-sm"><span className="text-orange-500 bg-orange-50 p-1.5 rounded-lg"><Users size={16} /></span> Top Shoppers</h3>
            <button className="text-[10px] text-slate-500 font-medium hover:text-slate-800 underline">View All</button>
          </div>
          <div className="space-y-5">
            {topCustomers.map((cust, idx) => (
              <div key={idx} className="flex items-center justify-between group hover:bg-slate-50 -mx-2 px-2 py-1.5 rounded transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-sm ${cust.img}`}>
                     {cust.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">{cust.name}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                       @ {cust.loc} • {cust.orders} Orders
                    </p>
                  </div>
                </div>
                <div className="font-bold text-sm text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  {cust.total}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold flex items-center gap-2 text-sm"><span className="text-orange-500 bg-orange-50 p-1.5 rounded-lg"><Package size={16} /></span> Top Categories</h3>
            <DropdownFilter value={topCatFilter} options={['Weekly', 'Monthly', 'Yearly']} onChange={setTopCatFilter} />
          </div>
          
          <div className="flex items-center flex-1">
            <div className="w-1/2 h-40 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topCategoriesData}
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {topCategoriesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-50 flex items-center justify-center font-bold text-slate-400 text-[10px]">
                  100%
                </div>
              </div>
            </div>
            
            <div className="w-1/2 pl-6 space-y-4">
              <div>
                <p className="text-[10px] text-slate-500 flex items-center gap-1.5 mb-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#1E3A8A]"></span> Groceries
                </p>
                <p className="font-bold text-sm ml-3.5">{Math.round(1250 * catMult)} <span className="text-[10px] text-slate-400 font-normal">Sales</span></p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 flex items-center gap-1.5 mb-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#F97316]"></span> Beverages
                </p>
                <p className="font-bold text-sm ml-3.5">{Math.round(850 * catMult)} <span className="text-[10px] text-slate-400 font-normal">Sales</span></p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 flex items-center gap-1.5 mb-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#38BDF8]"></span> Snacks
                </p>
                <p className="font-bold text-sm ml-3.5">{Math.round(620 * catMult)} <span className="text-[10px] text-slate-400 font-normal">Sales</span></p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
            <p className="text-[11px] font-bold text-slate-800 mb-3">Category Statistics</p>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#1E3A8A]"></span> Total Number Of Categories</span>
              <span className="font-bold text-slate-800">{Math.round(24 * catMult)}</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#F97316]"></span> Total Number Of Products</span>
              <span className="font-bold text-slate-800">{Math.round(1850 * catMult)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 7: Order Statistics (Heatmap placeholder) */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold flex items-center gap-2 text-sm"><span className="text-purple-500 bg-purple-50 p-1.5 rounded-lg"><Package size={16} /></span> Order Statistics</h3>
          <DropdownFilter value={orderStatFilter} options={['Weekly', 'Monthly', 'Yearly']} onChange={setOrderStatFilter} />
        </div>
        
        {/* Heatmap visualization placeholder */}
        <div className="w-full flex overflow-x-auto text-[9px] text-slate-400 pb-2">
          <div className="flex flex-col gap-1 pr-2 mt-4 text-right">
            <span className="h-6 flex items-center justify-end">18 Jun</span>
            <span className="h-6 flex items-center justify-end">16 Jun</span>
            <span className="h-6 flex items-center justify-end">14 Jun</span>
            <span className="h-6 flex items-center justify-end">12 Jun</span>
            <span className="h-6 flex items-center justify-end">10 Jun</span>
            <span className="h-6 flex items-center justify-end">8 Jun</span>
            <span className="h-6 flex items-center justify-end">6 Jun</span>
          </div>
          <div className="flex gap-1 flex-1 min-w-[600px]">
             {Array.from({ length: 12 }).map((_, colIndex) => (
                <div key={colIndex} className="flex flex-col gap-1 flex-1">
                  {Array.from({ length: 7 }).map((_, rowIndex) => {
                     const isOrange = (rowIndex === 1 && colIndex > 7) || (rowIndex === 4 && colIndex < 5) || (rowIndex === 6 && colIndex > 6);
                     const isLightOrange = (rowIndex === 0 && colIndex > 5) || (rowIndex === 2 && colIndex < 8) || (rowIndex === 5 && colIndex > 2);
                     
                     // Adding some visual variation when filter changes
                     const rand = (orderStatFilter.length + colIndex + rowIndex) % 3;
                     const applyOrange = isOrange || (orderStatFilter === 'Monthly' && rand === 0);
                     const applyLight = isLightOrange || (orderStatFilter === 'Yearly' && rand === 1);

                     return (
                       <div 
                         key={`${colIndex}-${rowIndex}`} 
                         className={`h-6 rounded-sm w-full transition-colors duration-500 cursor-pointer hover:opacity-80 ${applyOrange ? 'bg-[#F97316]' : applyLight ? 'bg-[#FED7AA]' : 'bg-orange-50'}`}
                         title={`${Math.floor(Math.random() * 50)} Orders`}
                       ></div>
                     )
                  })}
                </div>
             ))}
          </div>
        </div>
      </div>

    </div>
  );
}
