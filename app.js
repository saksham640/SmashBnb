const express = require("express");
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const sampleListing = require("./samples/samplelisting.js");
const path = require("path");
const ejsMate = require("ejs-mate");
const Review = require("./models/review.js");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const flash = require("connect-flash");
const { hashSync, compareSync } = require("bcrypt");
const cookieParser = require("cookie-parser");
const mongoStore = require("connect-mongo");
const UserModel = require("./models/userModel.js");
const userModel = require("./models/userModel.js");

const app = express();
const port = 8080;
let loggedIn = {status: 0, username: ''};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.engine("ejs", ejsMate);

const MONGO_URL = `mongodb+srv://saksham:saksham12@cluster0.7jiaptp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

async function main() {
    await mongoose.connect(MONGO_URL);
    console.log("Connection to db successful");
}

main().catch(err => {
    console.log(err);
}); 

app.use(session({
    secret: 'sakshamcat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    store: mongoStore.create({ mongoUrl: MONGO_URL, collectionName: 'sessions' }),
}));

passport.use(new LocalStrategy(
    async function(username, password, done) {
        try {
            const user = await UserModel.findOne({ username }).exec();
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            if (!compareSync(password, user.password)) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
    try {
        const user = await UserModel.findById(id).exec();
        done(null, user);
    } catch (err) {
        done(err);
    }
});

app.use(passport.initialize());
app.use(passport.session());

app.listen(port, () => {
    console.log("server On");
});

//user ka login check karne ka middleware

app.use(async function (req, res, next) {
    if(req.session.passport){
        loggedIn.status = 1;
       let activeUser = await userModel.findById(req.session.passport.user);
       loggedIn.username = activeUser.username;
    }else{
        loggedIn.status = 0;
        loggedIn.username = "";
    }
    console.log(loggedIn.status);
    console.log(loggedIn.username);
    next();
});

//

app.get("/", (req, res) => {
    res.redirect("/listings");
});

 
app.get("/testlisting", async (req, res) => {
    await sampleListing.save();
    console.log("saved");
});

app.get("/Listings", async (req, res) => {
    let allListings = await Listing.find();
    res.render("listings.ejs", { allListings,loggedIn });
});

app.get("/listings/:id", async (req, res) => {
    let listingId = req.params.id;
    let requestedListing = await Listing.findById(listingId).populate("reviews");
    res.render("singleListing.ejs", { requestedListing, loggedIn  });
});

app.get("/listings/:id/edit", async (req, res) => {
    let listingId = req.params.id;
    let requestedListing = await Listing.findById(listingId);
    res.render("editListing.ejs", { requestedListing, loggedIn  });
});

app.post("/listings/:id/update", async (req, res) => {
    if (req.body.image != "") {
        await Listing.findByIdAndUpdate(req.params.id, { image: { url: req.body.image }, });
    }
    if (req.body.description != "") {
        await Listing.findByIdAndUpdate(req.params.id, { description: req.body.description });
    }
    if (req.body.title != "") {
        await Listing.findByIdAndUpdate(req.params.id, { title: req.body.title });
    }
    if (req.body.price != "") {
        await Listing.findByIdAndUpdate(req.params.id, { price: req.body.price });
    }
    if (req.body.location != "") {
        await Listing.findByIdAndUpdate(req.params.id, { location: req.body.location });
    }
    if (req.body.country != "") {
        await Listing.findByIdAndUpdate(req.params.id, { country: req.body.country });
    }
    res.redirect(`/listings/${req.params.id}`);
});

app.get("/listings/:id/delete", async (req, res) => {
    let listingId = req.params.id;
    let requestedListing = await Listing.findById(listingId).populate("reviews");
    await Review.deleteMany({ _id: { $in: requestedListing.reviews } });
    await Listing.findByIdAndDelete(listingId);
    res.redirect("/listings");
});

app.get("/addListing", isAuthenticated , (req, res) => {
    res.render("addListing.ejs", { loggedIn });
});

app.post("/listings", async (req, res) => {
    let input = req.body;
    let newListing = new Listing({
        image: { url: input.image, },
        title: input.title,
        description: input.description,
        price: input.price,
        location: input.location,
        country: input.country,
    });
    newListing.save();
    if (newListing.image.url == "") {
        await Listing.findByIdAndUpdate(newListing._id, { image: { url: "https://images.unsplash.com/photo-1626621338418-713655538d99?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", } });
    }
    if (newListing.title == "") {
        await Listing.findByIdAndUpdate(newListing._id, { title: "come up with a name brooo", });
    }
    if (newListing.description == "") {
        await Listing.findByIdAndUpdate(newListing._id, { description: "saksham sed you didn't write any description, anyways, if you leave the image field empty you'll see the sexy triund", });
    }
    if (newListing.price == "") {
        await Listing.findByIdAndUpdate(newListing._id, { price: 69420, });
    }
    res.redirect("/listings");
});

app.post("/listings/:id/review", async (req, res) => {
    console.log(req.body);
    let requestedListing = await Listing.findById(req.params.id);
    let thisReview = new Review(req.body.review);
    requestedListing.reviews.push(thisReview);
    await thisReview.save();
    await requestedListing.save();
    requestedListing = await Listing.findById(req.params.id);
    console.log(requestedListing);
    res.redirect(`/listings/${requestedListing._id}`);
});

app.get("/listings/:id/reviews/:reviewId/delete", async (req, res) => {
    await Review.findByIdAndDelete(req.params.reviewId);
    await Listing.findByIdAndUpdate(req.params.id, { $pull: { reviews: req.params.reviewId } });
    console.log("review deleted");
    res.redirect(`/listings/${req.params.id}/`);
});

app.get("/signUp",(req,res)=>{
    res.render("signUpPage.ejs", {loggedIn} );
});

app.post("/signUp", async (req,res)=>{
    console.log(req.body);
    let newUser = new userModel({
        username: req.body.username,
        email: req.body.email,
        password: hashSync(req.body.password,2),
    });
    await newUser.save();
    console.log(newUser);
    res.redirect('/login');
});

app.get("/login",(req,res)=>{
    res.render("loginPage.ejs", {loggedIn} );
})

app.post('/login', 
    passport.authenticate('local', { successRedirect: '/listings', failureRedirect: '/login' })
);

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else{
    res.redirect('/login');
    }
}

app.get('/logout', (req, res, next) => {
    req.logout(err => {
        if (err) {
            return next(err);
        }
        req.session.destroy(err => {
            if (err) {
                return next(err);
            }
            res.redirect('/login'); // Redirect to login after logout
        });
    });
});

