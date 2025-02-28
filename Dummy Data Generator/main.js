const express=require('express')
const mongoose=require('mongoose')
const Employee=require("./models/Employee")
const app=express()
mongoose.connect('mongodb://127.0.0.1:27017/company')
const port=3000
app.set('view engine','ejs')
const getrandom=(arr)=>{
    let rno=Math.floor(Math.random()*(arr.length-1))
    return arr[rno]
}
app.get('/',(req,res)=>{
    res.render('index')
})
app.get('/generate',async(req,res)=>{
//  clear the collection
await Employee.deleteMany({})   
// get random data

    let randomname=["Ayush","Aman","Aniket","Siddharth"]
    let randomcity=["Patna","Delhi","Gurgaon","Lucknow"]
    let randomlang=["Java","Python","C++"]
    for (let index = 0; index < 10; index++) {
        let e =await Employee.create({
            name:getrandom(randomname),
            salary:Math.floor(Math.random()*220000),
            language:getrandom(randomlang),
            city:getrandom(randomcity),
            ismanager:Math.random()>0.5?true:false
        })
        console.log(e)
    } 
    res.render('index')
})
app.listen(port,()=>{
    console.log(`Running on port number${port}`)
})