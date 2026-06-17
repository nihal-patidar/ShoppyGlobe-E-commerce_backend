import express from 'express' ;
import dotenv from 'dotenv' ;


dotenv.config(); // intializing dotenv

const app = express(); // initializing a instance of a server

const PORT = process.env.PORT || 5000 ; // getting port number from .env file

app.listen(PORT,()=>{
    console.log("Server is listening on ", PORT);
})

