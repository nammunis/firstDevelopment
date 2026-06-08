import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import userRouter from "./routers/userRouter.js";
import jwt, { decode } from "jsonwebtoken";
import productRouter from "./routers/productRouters.js";
import dotenv from "dotenv"
import cors from 'cors'
dotenv.config()


const app = express();

app.use(cors()) // any request accept

app.use(bodyParser.json())

//Middle Way 
app.use(
    (req,res,next)=>{
        const value = req.header("Authorization")

        if(value!=null){
            const token = value.replace("Bearer ","")
            jwt.verify(token,
                process.env.JWT_SECRET,
                (err,decode)=>{
                    if(decode== null){
                        res.status(403).json({
                            message:'Unauthorized'
                        })
                    }else{
                        req.user = decode
                        next()
                    }
                    
            })
        }else{
            next()
        }
       
    }
)



const connectionString = process.env.MONGO_URL

mongoose.connect(connectionString).then(
    ()=>{
        console.log('Database Connected !✅')
    }
).catch(
    (err)=>{
        console.log('Database Connected Failed ❌')
        console.error(err);
    }
)

app.use('/user',userRouter)
app.use('/products',productRouter)



app.delete('/',(req,res)=>{
    console.log('This Is Delete Request')
    res.json(
        {message : 'Delete Request Done !'}
    )
})

const PORT = 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend server running on port ${PORT}`);
});


/*app.listen(5000, ()=>{
    console.log('Server Started! 🌐')
})*/