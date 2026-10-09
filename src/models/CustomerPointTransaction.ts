import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICustomerPointTransaction extends Document {
  customerId: mongoose.Types.ObjectId;
  customerMobile: string;
  billId?: mongoose.Types.ObjectId;
  billNumber?: string;
  pointsChanged: number;
  balance: number;
  reason: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerPointTransactionSchema: Schema<ICustomerPointTransaction> = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    customerMobile: { type: String, required: true },
    billId: { type: Schema.Types.ObjectId, ref: 'Sale' },
    billNumber: { type: String },
    pointsChanged: { type: Number, required: true },
    balance: { type: Number, required: true },
    reason: { type: String, required: true },
  },
  { timestamps: true }
);

const CustomerPointTransaction: Model<ICustomerPointTransaction> = mongoose.models.CustomerPointTransaction || mongoose.model<ICustomerPointTransaction>('CustomerPointTransaction', CustomerPointTransactionSchema);

export default CustomerPointTransaction;
