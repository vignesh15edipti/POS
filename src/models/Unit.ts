import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUnit extends Document {
  name: string;
  shortCode: string;
  allowDecimal: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UnitSchema: Schema<IUnit> = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    shortCode: { type: String, required: true, unique: true, trim: true, uppercase: true },
    allowDecimal: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Unit: Model<IUnit> = mongoose.models.Unit || mongoose.model<IUnit>('Unit', UnitSchema);

export default Unit;
