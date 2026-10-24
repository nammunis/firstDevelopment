import Category from '../models/category.js';
import Product from '../models/product.js';
import { hasManagementAccess } from "./userController.js";

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({}).sort({ name: 'asc' });
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Server Error while fetching categories' });
    }
};

/**
 * @desc    Create a new category
 * @route   POST /api/categories
 * @access  Private/Admin
 */
export const createCategory = async (req, res) => {
    if (!hasManagementAccess(req)) {
        return res.status(403).json({
            message: 'Access denied! Admin or Manager only.'
        });
    }

    const { name } = req.body;

    if (!name || name.trim() === '') {
        return res.status(400).json({ message: 'Category name is required' });
    }

    try {
        const normalizedName = name.trim();

        // The pre-save hook in the model will generate the slug automatically.
        const category = await Category.create({ name: normalizedName });

        res.status(201).json(category);
    } catch (error) {
        console.error('Error creating category:', error);
        // Handle potential duplicate key error from the database if the unique index is violated
        if (error.code === 11000) {
            // Return 409 Conflict, which the frontend is expecting
            return res.status(409).json({ message: 'Category already exists' });
        }
        res.status(500).json({ message: 'Server Error while creating category', error: error.message });
    }
};

/**
 * @desc    Delete a category
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
export const deleteCategory = async (req, res) => {
    if (!hasManagementAccess(req)) {
        return res.status(403).json({
            message: 'Access denied! Admin or Manager only.'
        });
    }

    const { id } = req.params;

    try {
        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Update all products belonging to this category to 'Uncategorised'
        const categorySlug = category.slug || category.name.toLowerCase().replace(/\s+/g, '-');
        await Product.updateMany({ category: categorySlug }, { category: 'Uncategorised' });

        // Delete the category
        await Category.findByIdAndDelete(id);

        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: 'Server Error while deleting category', error: error.message });
    }
};