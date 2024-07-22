const mongoose = require("mongoose");
const sampleListings = require("./data.js");
const listing = require("../models/listing.js");

const MONGO_URL = "mongodb+srv://saksham:saksham12@cluster0.7jiaptp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

main().then(()=>{
    console.log("Connection to db successful");
})
.catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(MONGO_URL);
}

const initDB = async()=>{
    await listing.deleteMany({});
    await listing.insertMany(sampleListings);
}

initDB();