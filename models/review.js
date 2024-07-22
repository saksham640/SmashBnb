const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    user:{
        type: String,
    },
    rating:{
        type: Number,
        min: 1,
        max: 5,
    },
    comment:{
        type: String,
    },
});

    const review = new mongoose.model("review", reviewSchema);
    module.exports = review;