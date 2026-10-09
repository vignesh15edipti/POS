import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Unit from '@/models/Unit';
import Category from '@/models/Category';
import SubCategory from '@/models/SubCategory';
import Brand from '@/models/Brand';
import Product from '@/models/Product';
import Supplier from '@/models/Supplier';
import Customer from '@/models/Customer';
import Sale from '@/models/Sale';
import Purchase from '@/models/Purchase';
import ExpenseCategory from '@/models/ExpenseCategory';
import Expense from '@/models/Expense';

export async function GET() {
  try {
    await connectToDatabase();

    await Unit.deleteMany({});
    await Category.deleteMany({});
    await SubCategory.deleteMany({});
    await Brand.deleteMany({});
    await Product.deleteMany({});
    await Supplier.deleteMany({});
    await Customer.deleteMany({});
    await Sale.deleteMany({});
    await Purchase.deleteMany({});
    await ExpenseCategory.deleteMany({});
    await Expense.deleteMany({});

    // Units
    const uKg = await Unit.create({ name: 'Kilogram', shortCode: 'KG', allowDecimal: true, isActive: true });
    const uPcs = await Unit.create({ name: 'Pieces', shortCode: 'PCS', allowDecimal: false, isActive: true });
    const uLtr = await Unit.create({ name: 'Liter', shortCode: 'LTR', allowDecimal: true, isActive: true });
    const uBox = await Unit.create({ name: 'Box', shortCode: 'BOX', allowDecimal: false, isActive: true });

    // Categories
    const cFruits = await Category.create({ name: 'Fresh Fruits', description: 'Daily fresh fruits', isActive: true });
    const cVeg = await Category.create({ name: 'Vegetables', description: 'Fresh vegetables', isActive: true });
    const cDairy = await Category.create({ name: 'Dairy & Milk', description: 'Milk, Butter, Cheese', isActive: true });
    const cSnacks = await Category.create({ name: 'Snacks & Biscuits', description: 'Chips, cookies', isActive: true });
    const cDrinks = await Category.create({ name: 'Beverages', description: 'Juice, Cola, Water', isActive: true });
    const cGrains = await Category.create({ name: 'Rice & Grains', description: 'Staples', isActive: true });

    // SubCategories
    const scApple = await SubCategory.create({ name: 'Apples', parentCategory: cFruits._id, isActive: true });
    const scLeafy = await SubCategory.create({ name: 'Leafy Veg', parentCategory: cVeg._id, isActive: true });
    const scChips = await SubCategory.create({ name: 'Potato Chips', parentCategory: cSnacks._id, isActive: true });
    
    // Brands
    const bAmul = await Brand.create({ name: 'Amul', isActive: true });
    const bLays = await Brand.create({ name: 'Lays', isActive: true });
    const bCocaCola = await Brand.create({ name: 'Coca Cola', isActive: true });
    const bAashirvaad = await Brand.create({ name: 'Aashirvaad', isActive: true });
    const bFarmFresh = await Brand.create({ name: 'Farm Fresh', isActive: true });

    // Suppliers
    const sFarmers = await Supplier.create({ supplierName: 'Ramu', companyName: 'Local Farmers Market', mobile: '9876543210', isActive: true });
    const sDistributor = await Supplier.create({ supplierName: 'Shiv', companyName: 'City FMCG Distributors', mobile: '9876543211', isActive: true });

    // Customers
    const cust1 = await Customer.create({ name: 'Rahul Sharma', mobile: '9000000001', totalOutstanding: 1500, isActive: true });
    const cust2 = await Customer.create({ name: 'Priya Patel', mobile: '9000000002', totalOutstanding: 0, isActive: true });

    // Expense Categories
    const ecRent = await ExpenseCategory.create({ name: 'Shop Rent', isActive: true });
    const ecElec = await ExpenseCategory.create({ name: 'Electricity Bill', isActive: true });
    const ecTea = await ExpenseCategory.create({ name: 'Tea & Snacks', isActive: true });

    // Expenses
    const today = new Date();
    await Expense.create({ category: ecElec.name, amount: 2500, expenseDate: new Date(today.getTime() - 86400000 * 2), paymentMethod: 'UPI', description: 'Monthly EB Bill' });
    await Expense.create({ category: ecTea.name, amount: 150, expenseDate: new Date(today.getTime() - 86400000), paymentMethod: 'CASH', description: 'Evening Tea for staff' });

    // Products
    const productsData = [
      { name: 'Kashmir Apple', sku: 'FRU-APL-' + Date.now(), barcode: '1000000000001', category: cFruits._id, subCategory: scApple._id, brand: bFarmFresh._id, unit: uKg._id, purchasePrice: 120, sellingPrice: 160, mrp: 180, minimumStock: 10, quantity: 45 },
      { name: 'Banana Robusta', sku: 'FRU-BAN-' + Date.now(), barcode: '1000000000002', category: cFruits._id, brand: bFarmFresh._id, unit: uKg._id, purchasePrice: 40, sellingPrice: 60, mrp: 80, minimumStock: 20, quantity: 30 },
      { name: 'Amul Taaza Milk 1L', sku: 'DAI-MIL-' + Date.now(), barcode: '1000000000005', category: cDairy._id, brand: bAmul._id, unit: uLtr._id, purchasePrice: 50, sellingPrice: 54, mrp: 55, minimumStock: 20, quantity: 15 },
      { name: 'Lays Magic Masala 50g', sku: 'SNA-LAY-' + Date.now(), barcode: '1000000000008', category: cSnacks._id, subCategory: scChips._id, brand: bLays._id, unit: uPcs._id, purchasePrice: 16, sellingPrice: 20, mrp: 20, minimumStock: 50, quantity: 110 },
      { name: 'Coca Cola 2L', sku: 'BEV-COC-' + Date.now(), barcode: '1000000000009', category: cDrinks._id, brand: bCocaCola._id, unit: uPcs._id, purchasePrice: 75, sellingPrice: 90, mrp: 95, minimumStock: 20, quantity: 35 },
      { name: 'Aashirvaad Atta 5kg', sku: 'GRA-ATT-' + Date.now(), barcode: '1000000000010', category: cGrains._id, brand: bAashirvaad._id, unit: uPcs._id, purchasePrice: 220, sellingPrice: 250, mrp: 280, minimumStock: 15, quantity: 22 }
    ];

    await Product.insertMany(productsData);

    return NextResponse.json({ success: true, message: 'Seeded successfully!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
