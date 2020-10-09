const express = require("express");
// const mysql   = require("mysql");
const app = express();
const session = require('express-session');


app.set("view engine", "ejs");
app.use(express.static("public")); //folder for img, css, js

//app.use(express.urlencoded()); //use to parse data sent using the POST method
app.use(session({ secret: 'any word', cookie: { maxAge: 1000 * 60 * 5 }}));
app.use(function(req, res, next) {
   res.locals.isAuthenticated = req.session.authenticated; 
   next();
});

app.get("/", async function(req, res){
    if (req.isAuthenticated) {
        console.log("AUTHENTICATED!");
    }
    res.render("home");
});//root

// functions //



//starting server
app.listen(process.env.PORT, process.env.IP, function(){
console.log("Express server is running...");
});

var listener = app.listen(8888, function(){
    console.log('Listening on port ' + listener.address().port); //Listening on port 8888
});