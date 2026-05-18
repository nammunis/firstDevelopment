import express from "express";
import Student from "../models/student.js";
import {getStudents, creatStudent } from "../controllers/studentController.js";


const studentRouter = express.Router()

studentRouter.get("/",getStudents)
studentRouter.post("/",creatStudent)




export default studentRouter