import { response } from "express";
import Product from "../models/product.js";
import { isAdmin } from "./userController.js";

export async function creatProduct(req,res) {

    if(! isAdmin(req)){
        return res.status(403).json({
            message:'Access denide Admin Only !'
        })
    }
    
    const product = new Product(req.body)

    try {
        const response = await product.save()
        res.json({
            message:'Product Created Successfully',
            product:response
        })
    } catch (error) {
        console.error('Error creating product:', error)
        return res.status(500).json({
            message:'Failed to creat product'
        })    
    }
}


export async function getProducts(req,res) {

    try {

        if(isAdmin(req)){
            const products = await Product.find()
            return res.json(products)
        }else{
            const products = await Product.find({isAvailable: true})
            return res.json(products)
        }
        
    } catch (error) {
        console.error('error fetching product',error)
        return res.status(500).json({
            message:'Faild to fetch products'
        })
        
    }
    
}

export async function deleteProduct(req,res) {
    if(!isAdmin(req)){
        return res.status(403).json({
            message:'Access denied !'
        })
    }
    try {

        const productId = req.params.productId

        const response = await Product.deleteOne({
            _id: productId
        })

        if(response.deletedCount===0){
            return res.status(404).json({
                message:'product not found'
            })
        }

        return res.json({
            message:'Product delete successfully'
        })
        
    } catch (error) {
        console.error('Error deleting product',error)
        return res.status(500).json({
            message:'Faild to delete product'
        })
    }
}


export async function updateProduct(req,res) {

    if(!isAdmin(req)){
        res.status(403).json({
            message:'Access denied Admin Only'
        })
        return
    }

    const data = req.body;
    const productId = req.params.productId
    
    try {
        await Product.updateOne(
            {
                _id: productId,
            },
            data
        )
        res.json({
            message:'Product update successfully'
        })
    } catch (error) {
        console.error('Error updating product:', error)
        res.status(500).json({
            message:'Faild to updated !'
        })
    }

    
}


export async function getProductInfo(req,res) {
    try {
    const productId = req.params.productId
    const product = await Product.findOne({productId:productId})
    if(product==null){
        res.status(404).json({
            message:'Product not found'
        })
        return
        }if(isAdmin(req)){
            res.json(product)
        }else{
            if(product.isAvaible){
                res.json(product)
            }else{
                res.status(404).json({
                    message:'product not found'
                })
            }
        }
    } catch (error) {
        console.error('Error find product:', error)
        res.status(500).json({
            message:'Faild to Find!'})
        
    }

}