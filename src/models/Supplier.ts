import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISupplier extends Document {
  supplierName: string;
  companyName: string;
  mobile: string;
  email?: string;
  address?: string;
  gstin?: string;
  contactPerson?: string;
  paymentTerms?: string;
  creditLimit: number;
  outstanding: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema: Schema<ISupplier> = new Schema(
  {
    supplierName: { type: String, required: true, trim: true },
    companyName: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    address: { type: String, trim: true },
    gstin: { type: String, trim: true },
    contactPerson: { type: String, trim: true },
    paymentTerms: { type: String, trim: true },
    creditLimit: { type: Number, default: 0 },
    outstanding: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Supplier: Model<ISupplier> = mongoose.models.Supplier || mongoose.model<ISupplier>('Supplier', SupplierSchema);
export default Supplier;
