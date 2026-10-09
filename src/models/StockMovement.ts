import mongoose, { Schema, Document, Model } from 'mongoose';

export type MovementType = 'INITIAL' | 'PURCHASE' | 'SALE' | 'SALES_RETURN' | 'PURCHASE_RETURN' | 'DAMAGE' | 'WASTAGE' | 'EXPIRY' | 'ADJUSTMENT' | 'PHYSICAL_COUNT';

export interface IStockMovement extends Document {
  productId: mongoose.Types.ObjectId;
  productName: string;
  sku: string;
  movementType: MovementType;
  quantity: number;
  beforeStock: number;
  afterStock: number;
  referenceType?: string;
  referenceId?: mongoose.Types.ObjectId;
  reason?: string;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const StockMovementSchema: Schema<IStockMovement> = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    productName: { type: String, required: true },
    sku: { type: String, required: true, uppercase: true },
    movementType: {
      type: String,
      enum: ['INITIAL', 'PURCHASE', 'SALE', 'SALES_RETURN', 'PURCHASE_RETURN', 'DAMAGE', 'WASTAGE', 'EXPIRY', 'ADJUSTMENT', 'PHYSICAL_COUNT'],
      required: true,
      index: true
    },
    quantity: { type: Number, required: true },
    beforeStock: { type: Number, required: true },
    afterStock: { type: Number, required: true },
    referenceType: { type: String },
    referenceId: { type: Schema.Types.ObjectId },
    reason: { type: String, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Employee' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const StockMovement: Model<IStockMovement> = mongoose.models.StockMovement || mongoose.model<IStockMovement>('StockMovement', StockMovementSchema);
export default StockMovement;
