import express from 'express' ;
import dotenv from 'dotenv' ;
import mongoose from 'mongoose';


dotenv.config(); // intializing dotenv

const app = express(); // initializing a instance of a server

const PORT = process.env.PORT || 5000 ; // getting port number from .env file


// connect server to mongodb to access database ;
mongoose.connect(process.env.DB_URL).then(()=>{
    console.log("database connected successfully");
})

app.listen(PORT,()=>{
    console.log("Server is listening on ", PORT);
})

