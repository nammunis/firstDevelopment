import mongoose from "mongoose"


//Student Schema 
const studentSchema =  new mongoose.Schema({
    name:String,
    age: Number,
    email:String
})

//Student  Connector || Model

const Student = mongoose.model("student",studentSchema)

export default Student;