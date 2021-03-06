var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
const campground = require("../models/campground");

//INDEX -  Show all campgrounds
router.get("/", function(req,res){
    //Get all campgrounds from DB
    Campground.find({}, function(err,allCampgrounds){
        if(err){
            console.log(err);
        }
        else {
            res.render("campgrounds/index", {campgrounds: allCampgrounds});
        }
    })
});

//NEW - Show form to create campground
router.get("/new", isLoggedIn, function(req,res){
    res.render("campgrounds/new");
});

//CREATE - Add new campground to DB
router.post("/", isLoggedIn,function(req,res) {
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = {name: name, image: image, description:desc, author: author};
    // Create a new campground and save to database
    Campground.create(newCampground, function(err,newlyCreated){
        if (err){
            console.log(err);
        }
        else {
            // redirect to campgrounds page
            res.redirect("/campgrounds");
        }
    });
});


//SHOW - shows more info about the campground
router.get("/:id", function(req,res){
    // find the campground with provided id
    Campground.findById(req.params.id).populate("comments").exec( function(err,foundCampground){
        if (err) {
           console.log(err);
        }
        else {
            console.log(foundCampground);
            //render the show page
            res.render("campgrounds/show",{campground: foundCampground});
        }
    })
})

//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", checkCampgroundOwnership, function(req,res){
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});

//UPDATE CAMPGROUND ROUTE
router.put("/:id", checkCampgroundOwnership, function(req,res){
    //find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err,updatedCampground){
        if (err) {
            res.redirect("/campgrounds");
        }
        else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
    //redirect somewhere
});

//DESTROY CAMPGROUND ROUTE
router.delete("/:id", checkCampgroundOwnership,function(req,res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if (err) {
            res.redirect("/campgrounds");
        }
        else {
            res.redirect("/campgrounds");
        }
    });
});

//middleware
function isLoggedIn(req,res,next){
    if (req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

function checkCampgroundOwnership(req,res,next) {
    // is user logged in
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundCampground){
            if (err) {
                res.redirect("back");
            }
            else {
                // does user own the campground
                if(foundCampground.author.id.equals(req.user._id)) {
                    next();
                }
                else{
                    res.redirect("back");
                }
            }
        });
    }
    // if not redirect
    else{
        res.redirect("back");
    }
}

module.exports = router;