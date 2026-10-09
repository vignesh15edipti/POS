import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubCategory extends Document {
  name: string;
  parentCategory: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubCategorySchema: Schema<ISubCategory> = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    parentCategory: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const SubCategory: Model<ISubCategory> = mongoose.models.SubCategory || mongoose.model<ISubCategory>('SubCategory', SubCategorySchema);

export default SubCategory;
