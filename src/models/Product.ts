import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  sku: string;
  barcode: string;
  category: string;
  subcategory?: string;
  brand?: string;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  pricePerKg?: number;
  mrp: number;
  taxRate: number;
  quantity: number;
  minimumStock: number;
  imageUrl?: string;
  isActive: boolean;
  expiryTracking: boolean;
  batchTracking: boolean;
  batches?: {
    batchNumber: string;
    expiryDate: Date;
    qty: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema<IProduct> = new Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    sku: { 
      type: String, 
      required: true, 
      unique: true, 
      uppercase: true, 
      trim: true, 
      index: true 
    },
    barcode: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true, 
      index: true 
    },
    category: { type: String, required: true, default: 'General', index: true },
    subcategory: { type: String, default: '' },
    brand: { type: String, default: '' },
    unit: { type: String, required: true, default: 'piece' },
    purchasePrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    pricePerKg: { type: Number, min: 0 },
    mrp: { type: Number, required: true, min: 0 },
    taxRate: { type: Number, default: 0, min: 0 },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    minimumStock: { type: Number, default: 10 },
    imageUrl: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    expiryTracking: { type: Boolean, default: false },
    batchTracking: { type: Boolean, default: false },
    batches: [{
      batchNumber: { type: String, required: true },
      expiryDate: { type: Date, required: true },
      qty: { type: Number, required: true, default: 0, min: 0 }
    }],
  },
  { timestamps: true }
);

// Prevent re-compilation error in Next.js hot reload
const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
