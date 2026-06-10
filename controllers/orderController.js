import Order from "../models/order.js";
import Product from "../models/product.js";

export async function creatOrder(req,res){
    try {
    if(req.user ==null){
        res.status(401).json(
            {
                message:'Please login to creat product !'
            }
        )
        return
    }

    const latestOrder = await Order.find().sort({date:-1})

    let orderId = 'WEBBASE0202'

    if(latestOrder.length>0){
        const lastOrderIdString = latestOrder[0].orderId
        const lastOrderIdWithoutPrefix = lastOrderIdString.replace('WEBBASE','')
        const lastOrderIdInteger = parseInt(lastOrderIdWithoutPrefix)

        const newOrderIdInteger = lastOrderIdInteger+1;

        const newOrderIdWithoutInteger = newOrderIdInteger.toString().padStart(4,'0') 

        orderId = 'WEBBASE'+newOrderIdWithoutInteger
    }

    const items = []
    let total=0

    if(req.body.items!== null && Array.isArray(req.body.items)){
        for (let i = 0; i < req.body.items.length; i++) {
            let item = req.body.items[i]

            let product = await Product.findOne({
                productId:item.productId
            })
            
            if(product==null){
                res.status(400).json({message:'Invalid Product Id' + item.productId})
                return
            }

            
            const itemQty = item.qty || item.qyt || 1;
            
            
            const itemTotal = product.price * itemQty;

           
            items[i]={
                productId: product.productId,
                name: product.name || item.name || "Product", 
                image: product.images && product.images.length > 0 ? product.images[0] : "no-image.jpg",
                price: product.price.toString(), 
                qty: itemQty,
                total: itemTotal 
            }

            
            total += itemTotal
        }
    }else{
        res.status(400).json({message:'Invalid Items Fomat'})
        return
    }

    const order =  new Order(
        {
            orderId: orderId,
            email: req.user.email,
            name: req.user.firstName+ ' '+ req.user.lastName,
            address: req.body.address,
            phone: req.body.phone,
            items:items,
            total:total 
        }
    )

    const result = await order.save()

    res.json({
        message:'Order Created Successfully!',
        result:result
    })

        
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        })
    }
}

export async function getOrders(req,res){
    if(req.user==null){
        res.status(401).json({
            message:'Please login to view orders'
        })
        return
    }

    try{
        if(req.user.role=='admin'){
        const orders = await Order.find().sort({date:-1})
        res.json(orders)}
        else{
        const orders = await order.find({email:req.user.email})
        res.json(orders)    
        }
    }catch(error){
        console.log(error)
        res.status(500).json({
            message:'Faild to fetch error'
        })
    }
}