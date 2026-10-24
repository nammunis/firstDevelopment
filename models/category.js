import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        unique: true,
        trim: true,
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        index: true,
    }
}, { timestamps: true });

CategorySchema.pre('save', function () {
    if (this.isModified('name') || this.isNew) {
        this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    }
});

const Category = mongoose.model("Category", CategorySchema);
export default Category;