const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema({
    title:{
        type: String,
    },
    description:{
        type: String,
    },
    image:{
        filename: String,
        url: String,
    },
    price:{
        type: Number,
    },
    location:{
        type: String,
    },
    country:{
        type: String,
    },
    rating:{
        type: Number,
    },
    reviews:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "review",
        },
    ],
});

const listing = mongoose.model("listing", listingSchema);

module.exports = listing;

