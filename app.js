// Airbnb clone root file, all routes will be defined here
const express = require("express");
const mongoose = require("mongoose");
const listing = require("./models/listing.js");
const sampleListing = require("./samples/samplelisting.js");
const path = require("path");
const ejsMate = require("ejs-mate");
const review = require("./models/review.js");

app = express();
const port = 8080;

app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname,"/public")));
app.use(express.urlencoded({extended: true}));
app.engine("ejs",ejsMate);

const MONGO_URL = `mongodb+srv://saksham:saksham12@cluster0.7jiaptp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

main().then(()=>{
    console.log("Connection to db successful");
})
.catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(MONGO_URL);
}

app.listen(port,()=>{
    console.log("server On");
});

app.get("/",(req,res)=>{
    res.redirect("/listings");
})

app.get("/testlisting",async (req,res)=>{
    await sampleListing.save();
    console.log("saved");
});

app.get("/Listings",async (req,res)=>{
    let allListings = await listing.find();
    res.render("listings.ejs",{allListings});
});

app.get("/listings/:id",async (req,res)=>{
    let listingId = req.params.id;
    let requestedListing = await listing.findById(listingId).populate("reviews");
    res.render("singleListing.ejs",{requestedListing});
});

app.get("/listings/:id/edit", async (req,res)=>{
    let listingId = req.params.id;
    let requestedListing = await listing.findById(listingId);
    res.render("editListing.ejs",{requestedListing});
});

app.post("/listings/:id/update", async (req,res)=>{
    if(req.body.image != ""){
        await listing.findByIdAndUpdate(req.params.id,{image : {url: req.body.image}, });
    }
    if(req.body.description != ""){
        await listing.findByIdAndUpdate(req.params.id,{description: req.body.description});
    }
    if(req.body.title != ""){
        await listing.findByIdAndUpdate(req.params.id,{title : req.body.title});
    }
    if(req.body.price != ""){
        await listing.findByIdAndUpdate(req.params.id,{price : req.body.price});
    }
    if(req.body.location != ""){
        await listing.findByIdAndUpdate(req.params.id,{location : req.body.location});
    }
    if(req.body.country != ""){
        await listing.findByIdAndUpdate(req.params.id,{country : req.body.country});
    }
    res.redirect(`/listings/${req.params.id}`);
});

app.get("/listings/:id/delete",async (req,res)=>{
    let listingId = req.params.id;
    await listing.findByIdAndDelete(listingId);
    res.redirect("/listings");
});

app.get("/addListing",(req,res)=>{
    res.render("addListing.ejs");
})

app.post("/listings",async (req,res)=>{
    let input = req.body;
    let newListing = new listing({
        image:{ url: input.image, },
        title: input.title,
        description: input.description,
        price: input.price,
        location: input.location,
        country: input.country,
    });
    newListing.save();
    if(newListing.image.url == ""){
        await listing.findByIdAndUpdate(newListing._id,{image:{url:"https://images.unsplash.com/photo-1626621338418-713655538d99?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",}});
    }
    if(newListing.title == ""){
        await listing.findByIdAndUpdate(newListing._id,{title:"come up with a name brooo",});
    }
    if(newListing.description == ""){
        await listing.findByIdAndUpdate(newListing._id,{description:"saksham sed you didn't write any description, anyways, if you leave the image field empty you'll see the sexy triund",});
    }
    if(newListing.price == ""){
        await listing.findByIdAndUpdate(newListing._id,{price:69420,});
    }
    res.redirect("/listings");
});

app.post("/listings/:id/review", async (req,res)=>{
    console.log(req.body);
    requestedListing = await listing.findById(req.params.id);
    thisreview = new review(req.body.review);
    requestedListing.reviews.push(thisreview);
    await thisreview.save();
    await requestedListing.save();
    requestedListing = await listing.findById(req.params.id);
    console.log(requestedListing);
    res.redirect(`/listings/${requestedListing._id}`)
});

app.get("/bund",(req,res)=>{
    res.send("");
});
