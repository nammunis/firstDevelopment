import express from 'express'
import { creatProduct, deleteProduct, getProductInfo, getProducts, searchProduct, updateProduct } from '../controllers/productController.js'

const productRouter = express.Router()

productRouter.post('/', creatProduct)

productRouter.get('/', getProducts)

productRouter.get('/search/:query', searchProduct)

productRouter.get('/:productId', getProductInfo)

productRouter.delete('/:productId', deleteProduct)

productRouter.put('/:productId', updateProduct)



export default productRouter