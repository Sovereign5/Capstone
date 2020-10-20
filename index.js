const express = require("express");
const mysql   = require("mysql");
const app = express();
const session = require('express-session');


app.set("view engine", "ejs");
app.use(express.static("public")); //folder for img, css, js

app.use(express.urlencoded()); //use to parse data sent using the POST method
app.use(session({ secret: 'any word', cookie: { maxAge: 1000 * 60 * 5 }}));
app.use(function(req, res, next) {
    res.locals.isAuthenticated = req.session.authenticated;
    next();
});
app.get("/driver", async function(req,res){
    res.render("driver");
});

app.post("/driver", async function(){
   let rows = await insertDriverInfo(req.body);
   console.log(rows);
});

app.get("/database", async function(req,res){
    res.render("database");
});

app.get("/", async function(req, res){
    if (req.isAuthenticated) {
        console.log("AUTHENTICATED!");
    }
    res.render("home");
});//root

// functions //

function dbConnection(){

    let conn = mysql.createConnection({
        host: "us-cdbr-east-02.cleardb.com",
        user: "b3cda0ec42ae37",
        password: "7799d3f9",
        database: "heroku_89dd359c69c2ed2"
    }); //createConnection

    return conn;

}

//starting server
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Express server is running...");
});

var listener = app.listen(8888, function(){
    console.log('Listening on port ' + listener.address().port); //Listening on port 8888
});