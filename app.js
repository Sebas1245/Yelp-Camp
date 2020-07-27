var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var Campground = require("./models/campground");
var Comment = require("./models/comment");
var User = require("./models/user");
var seedDB = require("./seeds")
var commentRoutes = require("./routes/comments");
var methodOverride = require("method-override");

// requiring routes
var commentRoutes       = require("./routes/comments"),
    campgroundRoutes    = require("./routes/campgrounds"),
    indexRoutes         = require("./routes/index");



mongoose.connect("mongodb+srv://Sebas:Sebas@yelpcamp-zqtdm.mongodb.net/test?retryWrites=true&w=majority", {
    useNewUrlParser:true,
    useCreateIndex:true
}).then(() => {
    console.log("Connected to DB");
}).catch(err => {
    console.log('ERROR:', err.message);
});

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
// seed the database // seedDB();

// =========================
// Passport Configuration
// =========================
app.use(require("express-session")({
    resave: false,
    saveUninitialized: false,
    secret: "something"
    }
));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    next();
})

app.use("/",indexRoutes);
app.use("/campgrounds",campgroundRoutes);
app.use("/campgrounds/:id/comments",commentRoutes);

app.listen(3000, function(){
    console.log("The YelpCamp Server has started.");
})

