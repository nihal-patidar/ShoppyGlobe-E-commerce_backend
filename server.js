import express from 'express' ;
import dotenv from 'dotenv' ;
import mongoose from 'mongoose';
import routes from './routes.js';


dotenv.config(); // intializing dotenv

const app = express(); // initializing a instance of a server

const PORT = process.env.PORT || 3000 ; // getting port number from .env file

app.use(express.json())

app.use('/', routes);
// connect server to mongodb to access database ;


mongoose.connect(process.env.DB_URL).then(()=>{
    console.log("database connected successfully");
}).catch(err=> console.log(err))

app.listen(PORT,()=>{
    console.log("Server is listening on ", PORT);
})

