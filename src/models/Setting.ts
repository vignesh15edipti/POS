import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISetting extends Document {
  billsRequiredForPoints: number;
  pointsAwarded: number;
  pointsDiscountThreshold: number;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  gstin?: string;
  salesInvoicePrefix: string;
  purchaseInvoicePrefix: string;
  createdAt: Date;
  updatedAt: Date;
}

const SettingSchema: Schema<ISetting> = new Schema(
  {
    billsRequiredForPoints: { type: Number, default: 10 },
    pointsAwarded: { type: Number, default: 5 },
    pointsDiscountThreshold: { type: Number, default: 100 },
    discountType: { type: String, enum: ['fixed', 'percentage'], default: 'fixed' },
    discountValue: { type: Number, default: 50 },
    shopName: { type: String, default: 'TN FRESHKART GREEN' },
    shopAddress: { type: String, default: 'TN FRESHKART GREEN' },
    shopPhone: { type: String, default: '+91 9876543210' },
    gstin: { type: String, trim: true },
    salesInvoicePrefix: { type: String, default: 'INV-' },
    purchaseInvoicePrefix: { type: String, default: 'PUR-' },
  },
  { timestamps: true }
);

const Setting: Model<ISetting> = mongoose.models.Setting || mongoose.model<ISetting>('Setting', SettingSchema);

export default Setting;
