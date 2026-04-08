const express = require('express');

const rateLimiter = require('./app/utils/limiter');
const dbConnection = require("./app/config/dbConfig")
const mainRoute = require("./app/routes/indexRoute");
const cors = require('cors');

const app = express();

const port = 4000;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  }),
);
// app.use(rateLimiter);

app.use(express.json());
dbConnection();

app.use(express.json());

app.use(mainRoute);

// app.use(express.urlencoded({extended:true}))

app.listen(port, (error) => {
    if (error) {
        console.log('Unable to run the server');
    } else {
        console.log(`Server is running on this port: ${port}`)
    }
});