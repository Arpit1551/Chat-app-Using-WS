import mongoose from "mongoose";

const DB_Connection = async ()=>{
    try {
        mongoose.connect(process.env.DB_URL)
        .then(()=>{console.log("Your Database is connected!")})
        .catch(()=>{console.log("Unable to connect to your database!")});
    } catch (error) {
        console.log(error);
    }
}

export default DB_Connection;