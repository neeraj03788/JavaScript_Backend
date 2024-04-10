import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app=express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true

}))

app.use(express.json({limit:"64kb"})) //json limit
app.use(express.urlencoded({extended:true, limit:"64kb"})) //urlencode like %20 +
app.use(express.static("public"))  //pdf images on own server


app.use(cookieParser())


export { app }