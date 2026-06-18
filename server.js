import express from 'express' ;
import dotenv from 'dotenv' ;
import mongoose from 'mongoose';
import routes from './routes.js';


dotenv.config(); // intializing dotenv for accessing environment variable (safe)

const app = express(); // initializing a instance of a server

const PORT = process.env.PORT || 3000 ; // getting port number from .env file

app.use(express.json()) // converts all stringified data to json and make req.body accessible

app.use('/', routes); // single entry point for all routes


// connect server to mongodb to access database ;
mongoose.connect(process.env.DB_URL).then(()=>{ 
    console.log("database connected successfully");
}).catch(err=> console.log(err))  // error handling 


// start server and tells it to listen for requests on 3000 port number
app.listen(PORT,()=>{  
    console.log("Server is listening on ", PORT);
})

