import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IShift extends Document {
  cashierName: string;
  cashierId: string;
  counterId: string;
  shiftStart: Date;
  shiftEnd?: Date;
  openingFloat: number;
  cashSales: number;
  cardSales: number;
  upiSales: number;
  expectedCashInDrawer?: number;
  physicalCashInDrawer?: number;
  variance?: number;
  status: 'OPEN' | 'CLOSED';
}

const ShiftSchema: Schema = new Schema(
  {
    cashierName: { type: String, required: true },
    cashierId: { type: String, required: true },
    counterId: { type: String, required: true },
    shiftStart: { type: Date, default: Date.now },
    shiftEnd: { type: Date },
    openingFloat: { type: Number, required: true, default: 0 },
    cashSales: { type: Number, default: 0 },
    cardSales: { type: Number, default: 0 },
    upiSales: { type: Number, default: 0 },
    expectedCashInDrawer: { type: Number },
    physicalCashInDrawer: { type: Number },
    variance: { type: Number },
    status: { type: String, enum: ['OPEN', 'CLOSED'], default: 'OPEN' },
  },
  {
    timestamps: true,
  }
);

export default (mongoose.models.Shift as Model<IShift>) || mongoose.model<IShift>('Shift', ShiftSchema);
