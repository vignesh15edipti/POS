import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPurchaseItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  sku: string;
  barcode: string;
  quantity: number;
  unit: string;
  purchasePrice: number;
  gst: number;
  batchNumber?: string;
  expiryDate?: Date;
  discount: number;
  total: number;
}

export interface IPurchase extends Document {
  purchaseNumber: string;
  invoiceNumber: string;
  supplierId: mongoose.Types.ObjectId;
  purchaseDate: Date;
  items: IPurchaseItem[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  paymentStatus: 'PAID' | 'PARTIAL' | 'DUE';
  amountPaid: number;
  amountDue: number;
  status: 'COMPLETED' | 'CANCELLED';
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseItemSchema: Schema<IPurchaseItem> = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  sku: { type: String, required: true },
  barcode: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true },
  purchasePrice: { type: Number, required: true, min: 0 },
  gst: { type: Number, default: 0 },
  batchNumber: { type: String },
  expiryDate: { type: Date },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true, min: 0 },
});

const PurchaseSchema: Schema<IPurchase> = new Schema(
  {
    purchaseNumber: { type: String, required: true, unique: true, index: true },
    invoiceNumber: { type: String, required: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
    purchaseDate: { type: Date, required: true, default: Date.now },
    items: [PurchaseItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    paymentStatus: { type: String, enum: ['PAID', 'PARTIAL', 'DUE'], default: 'PAID' },
    amountPaid: { type: Number, default: 0 },
    amountDue: { type: Number, default: 0 },
    status: { type: String, enum: ['COMPLETED', 'CANCELLED'], default: 'COMPLETED' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Employee' },
  },
  { timestamps: true }
);

const Purchase: Model<IPurchase> = mongoose.models.Purchase || mongoose.model<IPurchase>('Purchase', PurchaseSchema);
export default Purchase;
