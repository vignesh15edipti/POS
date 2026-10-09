import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExpense extends Document {
  category: string;
  amount: number;
  expenseDate: Date;
  paymentMethod: 'CASH' | 'CARD' | 'UPI' | 'BANK_TRANSFER';
  description?: string;
  reference?: string;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema: Schema<IExpense> = new Schema(
  {
    category: { type: String, required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    expenseDate: { type: Date, required: true, default: Date.now },
    paymentMethod: { type: String, enum: ['CASH', 'CARD', 'UPI', 'BANK_TRANSFER'], default: 'CASH' },
    description: { type: String, trim: true },
    reference: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Employee' },
  },
  { timestamps: true }
);

const Expense: Model<IExpense> = mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);
export default Expense;
