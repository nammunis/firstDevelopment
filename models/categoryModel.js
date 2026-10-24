const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
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
    },
}, { timestamps: true });

categorySchema.pre('save', function (next) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    next();
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;