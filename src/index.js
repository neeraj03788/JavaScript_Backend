// require('dotenv').config({path:'./env'})
import mongoose from 'mongoose'
// import { DB_Name } from './constants';
import express from 'express'
import { error } from 'console';
import connectDB from './db/index.js';
import dotenv from 'dotenv'


dotenv.config({
    path:'./env'
})

connectDB()














/* const app=express();

;(async()=>{try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_Name}`)
    app.on("Error",(error)=>{
        console.log("Error",error);
        throw error;
    })
    app.listen(process.env.PORT,()=>{
        console.log(`app is listeening on port ${process.env.PORT}`);
    })
} catch (error) {
    console.log("DB connection error",error)
}})() */

