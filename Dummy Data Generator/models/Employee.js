const mongoose=require('mongoose')
const schema=new mongoose.Schema({
    name:String,
    salary:Number,
    language:String,
    city:String,
    ismanager:Boolean
})
const Employee=mongoose.model('Employee',schema)
module.exports=Employee
