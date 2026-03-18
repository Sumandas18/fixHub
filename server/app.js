

const express = require('express');
const app = express();
const rateLimiter = require('./app/utils/limiter')
app.use(rateLimiter)

const dbConnection = require("./app/config/dbConfig")
dbConnection()

app.use(express.json())
app.use(express.urlencoded({extended:true}))


const port = 4000
app.listen(port,(error)=>{
    if(error){
        console.log('Unable to run the server');
    }else{
        console.log(`Server is running on this port: ${port}`)
    }
})