import Student from "../models/student.js"

export function getStudents(req,res){
    Student.find().then(
        (students)=>{
            res.json(students)
        }
    ).catch(()=>{
        res.json({
            message:'Faild to fetch student'
        })
    })
}

export function creatStudent(req,res){
    console.log('This Is Post Request')

    if(req.user==null){
        res.status(403).json({
            message:'Unauthorized'
        })
        return
    }
    if(req.user.role != "admin"){
        res.status(403).json({
            message:"please as an admin to creat student"
        })
        return
    }
    console.log(req.body)
//Database Save Kranna Puluwn Student kenek
    const student = new Student(
        {
            name:req.body.name,
            age:req.body.age,
            email:req.body.email
        }
    )
    student.save().then(
        ()=>{
            res.json({
                message:'Database Saved !'
            })
        }
    ).catch(()=>{
        console.log('Data save problme')
    })
}