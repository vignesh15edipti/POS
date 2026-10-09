import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISaleItem {
  productId: mongoose.Types.ObjectId;
  productName: string;
  sku: string;
  barcode: string;
  unit: string;
  quantity: number;
  sellingPriceAtSale: number;
  purchasePriceAtSale: number;
  discount: number;
  tax: number;
  lineTotal: number;
}

export interface ISale extends Document {
  invoiceNumber: string;
  items: ISaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  paymentMethod: 'CASH' | 'CARD' | 'UPI' | 'CREDIT' | 'SPLIT';
  paymentStatus: 'PAID' | 'PARTIAL' | 'DUE';
  amountReceived: number;
  change: number;
  status: 'COMPLETED' | 'CANCELLED' | 'RETURNED' | 'PARTIAL_RETURN';
  cashierId?: mongoose.Types.ObjectId;
  cashierName?: string;
  customerId?: mongoose.Types.ObjectId;
  customerName?: string;
  shiftId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SaleItemSchema: Schema<ISaleItem> = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  sku: { type: String, required: true, uppercase: true },
  barcode: { type: String, required: true },
  unit: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  sellingPriceAtSale: { type: Number, required: true, min: 0 },
  purchasePriceAtSale: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  tax: { type: Number, default: 0, min: 0 },
  lineTotal: { type: Number, required: true, min: 0 },
});

const SaleSchema: Schema<ISale> = new Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    items: [SaleItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ['CASH', 'CARD', 'UPI', 'CREDIT', 'SPLIT'], default: 'CASH' },
    paymentStatus: { type: String, enum: ['PAID', 'PARTIAL', 'DUE'], default: 'PAID' },
    amountReceived: { type: Number, default: 0 },
    change: { type: Number, default: 0 },
    status: { type: String, enum: ['COMPLETED', 'CANCELLED', 'RETURNED', 'PARTIAL_RETURN'], default: 'COMPLETED', index: true },
    cashierId: { type: Schema.Types.ObjectId, ref: 'Employee' },
    cashierName: { type: String },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    customerName: { type: String },
    shiftId: { type: Schema.Types.ObjectId, ref: 'Shift' },
  },
  { timestamps: true }
);

const Sale: Model<ISale> = mongoose.models.Sale || mongoose.model<ISale>('Sale', SaleSchema);
export default Sale;
