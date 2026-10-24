import slugify from "slugify";
import Product from "../models/product.js";
import Category from "../models/category.js";
import { isAdmin, hasManagementAccess } from "./userController.js";

export async function creatProduct(req, res) {
    if (!hasManagementAccess(req)) {
        return res.status(403).json({
            message: 'Access denied! Admin or Manager only.'
        });
    }

    try {
        const {
            productId,
            productName,
            altName,
            labelledPrice,
            price,
            images,
            description,
            unit,
            stock,
            isAvailable,
            category
        } = req.body;

        let finalCategory = category;

        const isExistingCategory = await Category.findOne({
            $or: [
                { _id: category && category.match(/^[0-9a-fA-F]{24}$/) ? category : null },
                { slug: category }
            ]
        });

        if (!isExistingCategory && category) {
            const categorySlug = slugify(category, { lower: true });
            let existingCatBySlug = await Category.findOne({ slug: categorySlug });

            if (!existingCatBySlug) {
                const newCategory = new Category({
                    name: category,
                    slug: categorySlug
                });
                const savedCategory = await newCategory.save();
                finalCategory = savedCategory.slug;
            } else {
                finalCategory = existingCatBySlug.slug;
            }
        }

        const newProduct = new Product({
            productId,
            productName,
            altName,
            labelledPrice,
            price,
            images,
            description,
            unit,
            stock,
            isAvailable,
            category: finalCategory
        });

        const savedProduct = await newProduct.save();

        return res.status(201).json({
            message: 'Product Created Successfully',
            product: savedProduct
        });

    } catch (error) {
        console.error('Error creating product:', error);
        return res.status(500).json({
            message: 'Failed to create product',
            error: error.message
        });
    }
}

export async function getProducts(req, res) {
    try {
        if (hasManagementAccess(req)) {
            const products = await Product.find();
            return res.json(products);
        } else {
            const products = await Product.find({ isAvailable: true });
            return res.json(products);
        }
    } catch (error) {
        console.error('error fetching product', error);
        return res.status(500).json({
            message: 'Failed to fetch products'
        });
    }
}

export async function deleteProduct(req, res) {
    if (!hasManagementAccess(req)) {
        return res.status(403).json({
            message: 'Access denied! Admin or Manager only.'
        });
    }
    try {
        const productId = req.params.productId;
        const response = await Product.deleteOne({ productId: productId });

        if (response.deletedCount === 0) {
            return res.status(404).json({
                message: 'product not found'
            });
        }

        return res.json({
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting product', error);
        return res.status(500).json({
            message: 'Failed to delete product'
        });
    }
}

export async function updateProduct(req, res) {
    if (!hasManagementAccess(req)) {
        return res.status(403).json({
            message: 'Access denied! Admin or Manager only.'
        });
    }

    const data = req.body;
    const productId = req.params.productId;

    try {
        if (data.category) {
            let finalCategory = data.category;
            const isExistingCategory = await Category.findOne({
                $or: [
                    { _id: data.category && data.category.match(/^[0-9a-fA-F]{24}$/) ? data.category : null },
                    { slug: data.category }
                ]
            });

            if (!isExistingCategory) {
                const categorySlug = slugify(data.category, { lower: true });
                let existingCatBySlug = await Category.findOne({ slug: categorySlug });

                if (!existingCatBySlug) {
                    const newCategory = new Category({
                        name: data.category,
                        slug: categorySlug
                    });
                    const savedCategory = await newCategory.save();
                    finalCategory = savedCategory.slug;
                } else {
                    finalCategory = existingCatBySlug.slug;
                }
            }
            data.category = finalCategory;
        }

        await Product.updateOne({ productId: productId }, data);
        return res.json({
            message: 'Product updated successfully'
        });
    } catch (error) {
        console.error('Error updating product:', error);
        return res.status(500).json({
            message: 'Failed to update!',
            error: error.message
        });
    }
}

export async function getProductInfo(req, res) {
    try {
        const productId = req.params.productId;
        const product = await Product.findOne({ productId: productId });

        if (product == null) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        if (hasManagementAccess(req)) {
            return res.json(product);
        } else {
            if (product.isAvailable) {
                return res.json(product);
            } else {
                return res.status(404).json({
                    message: 'product not found'
                });
            }
        }
    } catch (error) {
        console.error('Error finding product:', error);
        return res.status(500).json({
            message: 'Failed to Find!'
        });
    }
}

export async function searchProduct(req, res) {
    const query = req.params.query;

    try {
        if (!query) {
            return res.json([]);
        }

        const products = await Product.find({
            $or: [
                { productName: { $regex: query, $options: "i" } },
                { altName: { $regex: query, $options: "i" } }
            ],
            isAvailable: true
        });

        return res.json(products);
    } catch (err) {
        console.error('Search Error:', err);
        return res.status(500).json({
            message: 'Failed to search products'
        });
    }
}