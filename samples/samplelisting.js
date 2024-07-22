const listing = require("../models/listing");

let sampleListing = new listing({
    title: "munni ka kotha",
    description: "just a sample",
    price: 99999,
    location: "model town",
    country: "India",
});

module.exports = sampleListing;