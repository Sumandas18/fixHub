const express = require('express');

const rateLimiter = require('./app/utils/limiter');
const dbConnection = require("./app/config/dbConfig")

const app = express();

const port = 4000;

app.use(rateLimiter);

dbConnection();

app.use(express.json());
// app.use(express.urlencoded({extended:true}))

app.listen(port, (error) => {
    if (error) {
        console.log('Unable to run the server');
    } else {
        console.log(`Server is running on this port: ${port}`)
    }
});