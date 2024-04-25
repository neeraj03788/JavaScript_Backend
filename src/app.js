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
app.use(express.static("public"))  //pdf images on own server and there is a public folder in our folder whose reference is here
app.use(cookieParser())


//routes import

import UserRouter from './routes/user.routes.js'

//routes declaration
/* first we write app.get() but now we have to write app.use() because we seperated 
router so to bring router we have use middleware app.use() */


app.use('/api/v1/users',UserRouter)

//












export { app }