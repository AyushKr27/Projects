const express = require('express')
const app = express()
const port = 5000
const dotenv=require('dotenv')
const bodyparser=require('body-parser')
const {MongoClient} =require('mongodb')
const cors=require('cors')
dotenv.config()

//connection url
const url='mongodb://localhost:27017'
const client=new MongoClient(url)

//database name
const dbname='PasswordManager'

app.use(bodyparser.json())
app.use(cors({
  origin: "https://projects-pearl-sigma.vercel.app",
}));
client.connect()

//getting all the passwords
app.get('/api/passwords', async(req, res) => {
    const db=client.db(dbname)
    const collection = db.collection('Passwords');
    const findResult = await collection.find({}).toArray();
  res.json(findResult)
}) 
//save password
app.post('/api/passwords', async(req, res) => {
  const password=req.body 
  const db=client.db(dbname)
    const collection = db.collection('Passwords');
    const findResult = await collection.insertOne(password);
  res.send({success:true,result:findResult})
}) 
//delete a password
app.delete('/api/passwords', async(req, res) => {
  const password=req.body 
  const db=client.db(dbname)
    const collection = db.collection('Passwords');
    const findResult = await collection.deleteOne(password);
  res.send({success:true,result:findResult})
}) 

app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`)
})