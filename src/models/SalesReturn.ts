import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISalesReturnItem {
  productId: mongoose.Types.ObjectId;
  productName: string;
  sku: string;
  returnQuantity: number;
  refundAmount: number;
  reason: string;
}

export interface ISalesReturn extends Document {
  returnNumber: string;
  saleId: mongoose.Types.ObjectId;
  invoiceNumber: string;
  items: ISalesReturnItem[];
  totalRefund: number;
  status: 'COMPLETED' | 'CANCELLED';
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SalesReturnItemSchema: Schema<ISalesReturnItem> = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  sku: { type: String, required: true },
  returnQuantity: { type: Number, required: true, min: 0.001 },
  refundAmount: { type: Number, required: true, min: 0 },
  reason: { type: String, required: true },
});

const SalesReturnSchema: Schema<ISalesReturn> = new Schema(
  {
    returnNumber: { type: String, required: true, unique: true, index: true },
    saleId: { type: Schema.Types.ObjectId, ref: 'Sale', required: true },
    invoiceNumber: { type: String, required: true },
    items: [SalesReturnItemSchema],
    totalRefund: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['COMPLETED', 'CANCELLED'], default: 'COMPLETED' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Employee' },
  },
  { timestamps: true }
);

const SalesReturn: Model<ISalesReturn> = mongoose.models.SalesReturn || mongoose.model<ISalesReturn>('SalesReturn', SalesReturnSchema);
export default SalesReturn;
