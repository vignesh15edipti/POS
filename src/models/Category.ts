import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubcategory {
  name: string;
  isActive: boolean;
}

export interface ICategory extends Document {
  name: string;
  subcategories: ISubcategory[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubcategorySchema = new Schema<ISubcategory>({
  name: { type: String, required: true, trim: true },
  isActive: { type: Boolean, default: true },
});

const CategorySchema: Schema<ICategory> = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    subcategories: [SubcategorySchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
