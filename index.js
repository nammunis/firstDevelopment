import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import Student from "./models/student.js";
import studentRouter from "./routers/studentRouters.js";
import userRouter from "./routers/userRouter.js";
import jwt, { decode } from "jsonwebtoken";


const app = express();

app.use(bodyParser.json())

//Middle Way 
app.use(
    (req,res,next)=>{
        const value = req.header("Authorization")

        if(value!=null){
            const token = value.replace("Bearer ","")
            jwt.verify(token,
                "cbc-6503",
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



const connectionString = "mongodb://fooddeliveryuser:123@ac-qtfwlyf-shard-00-00.ezf29xp.mongodb.net:27017,ac-qtfwlyf-shard-00-01.ezf29xp.mongodb.net:27017,ac-qtfwlyf-shard-00-02.ezf29xp.mongodb.net:27017/?ssl=true&replicaSet=atlas-6570fw-shard-0&authSource=admin&appName=FoodDeliverySystemCuster"

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

app.use("/student",studentRouter)
app.use('/user',userRouter)



app.delete('/',(req,res)=>{
    console.log('This Is Delete Request')
    res.json(
        {message : 'Delete Request Done !'}
    )
})



app.listen(5000, ()=>{
    console.log('Server Started! 🌐')
})