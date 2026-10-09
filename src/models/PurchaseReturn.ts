import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPurchaseReturnItem {
  productId: mongoose.Types.ObjectId;
  productName: string;
  sku: string;
  returnQuantity: number;
  refundAmount: number;
  reason: string;
}

export interface IPurchaseReturn extends Document {
  returnNumber: string;
  purchaseId: mongoose.Types.ObjectId;
  purchaseInvoiceNumber: string;
  supplierId: mongoose.Types.ObjectId;
  items: IPurchaseReturnItem[];
  totalRefund: number;
  status: 'COMPLETED' | 'CANCELLED';
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseReturnItemSchema: Schema<IPurchaseReturnItem> = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  sku: { type: String, required: true },
  returnQuantity: { type: Number, required: true, min: 0.001 },
  refundAmount: { type: Number, required: true, min: 0 },
  reason: { type: String, required: true },
});

const PurchaseReturnSchema: Schema<IPurchaseReturn> = new Schema(
  {
    returnNumber: { type: String, required: true, unique: true, index: true },
    purchaseId: { type: Schema.Types.ObjectId, ref: 'Purchase', required: true },
    purchaseInvoiceNumber: { type: String, required: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
    items: [PurchaseReturnItemSchema],
    totalRefund: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['COMPLETED', 'CANCELLED'], default: 'COMPLETED' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Employee' },
  },
  { timestamps: true }
);

const PurchaseReturn: Model<IPurchaseReturn> = mongoose.models.PurchaseReturn || mongoose.model<IPurchaseReturn>('PurchaseReturn', PurchaseReturnSchema);
export default PurchaseReturn;
