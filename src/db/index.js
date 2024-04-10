import mongoose  from "mongoose";
import { DB_Name }  from '../constants.js';


const connectDB=async()=>{
    try{
       const connectionInstance= await mongoose.connect(`${process.env.MONGODB_URI}/${DB_Name}`);
        console.log(` mongodb connected ${connectionInstance.connection.host}`);

}
    catch(error){
        console.log("mongo connection error in db");
        process.exit(1)


    }
}

export default connectDB