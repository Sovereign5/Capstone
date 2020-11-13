const express = require("express");
const mysql   = require("mysql");
const app = express();
const session = require('express-session');
// const distance = require('google-distance-matrix');

app.set("view engine", "ejs");
app.use(express.static("public")); //folder for img, css, js

app.use(express.urlencoded()); //use to parse data sent using the POST method
app.use(session({ secret: 'any word', cookie: { maxAge: 10000 * 60 * 5 }}));
app.use(function(req, res, next) {
    res.locals.isAuthenticated = req.session.authenticated;
    next();
});
app.get("/driver", async function(req,res){
    res.render("driver");
});

// Maptest, by Chris. This is purely to test Google Maps API for our
// project uses
app.get("/maptest", async function(req, res) {
    res.render("maptest");
});

app.post("/driver", async function(req, res){
    let rows = await insertDriverInfo(req.body);
    console.log(rows);

    let message = "Driver WAS NOT added to the database!";
    if (rows.affectedRows > 0) {
        message= "Driver successfully added!";
    }
    res.render("driver", {"message":message});

});


app.get("/database", isAuthenticated, async function(req,res){

    console.log("authenticated: ", req.session.authenticated);

    if (req.session.authenticated) {

        let driverList = await getDriverList();
        res.render("database", {"driverList": driverList});
    }
    else {
        res.render("login");
    }
});

app.get("/nonadmin", isAuthenticated, async function (req, res){
    console.log("authenticated: ", req.session.authenticated);
    if (req.session.authenticated) {
        let driverList = await getDriverList();
        res.render("nonadmin", {"driverList": driverList});
    }
    else {
        res.render("login");
    }
});

app.get("/deleteDriver", async function(req, res){
    let rows = await deleteDriver(req.query.name);
    console.log(rows);
    let message = "Driver WAS NOT deleted!";

    if (rows.affectedRows > 0) {
        message= "Driver successfully deleted!";
    }

    let driverList = await getDriverList();
    res.render("database", {"driverList":driverList});
});

app.get("/login", async function(req, res) {
    res.render("login");
});

app.post("/loginProcess", async function (req, res){
        let users = await getUsers();
        var validAcc = false;
        var validPass = false;
        var isAdmin = false;
        const {username, password} = req.body;
        if (!username || !password) {
            return res.status(400).render("login", {
                message: "Please enter a username or password"
            })
        }

        for (var i = 0; i < users.length; i++) {
            if (req.body.username == users[i].username) {
                validAcc = true;
            }
            if (validAcc) {
                if (req.body.password == users[i].password){
                    validPass = true;
                    if (users[i].admin == 1) {
                        isAdmin = true;
                    }
                    break;
                }
            }
        }

        //console.log(isAdmin, validAcc, validPass);

        if (validAcc && validPass) {
            req.session.authenticated = true;
            req.session.user = users[i].id;
            res.send({"loginSuccess":true, "admin":isAdmin});
        }
        else {
            res.send(false);
        }
});



app.get("/", async function(req, res){
    if (req.isAuthenticated) {
        console.log("AUTHENTICATED!");
    }
    res.render("home");
});//root

// functions //

function insertDriverInfo(body){
    let conn = dbConnection();

    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
            if (err) throw err;
            console.log("Connected!");

            let sql = `INSERT INTO drivertable
                        (first_name, last_name, produce_item, phone_number, license_plate)
                         VALUES (?,?,?,?,?)`;

            let params = [body.first_name, body.last_name, body.produce_item, body.phone_number, body.license_plate];

            conn.query(sql, params, function (err, rows, fields) {
                if (err) throw err;
                //res.send(rows);
                conn.end();
                resolve(rows);
            });

        });//connect
    });//promise
} // insertDriverInfo

function deleteDriver(name){

    let conn = dbConnection();

    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
            if (err) throw err;
            console.log("Connected!");

            let sql = `DELETE FROM drivertable
                      WHERE driver_id = ?`;

            conn.query(sql, [name], function (err, rows, fields) {
                if (err) throw err;
                //res.send(rows);
                conn.end();
                resolve(rows);
            });

        });//connect
    });//promise
}

function getDriverList(){

    let conn = dbConnection();

    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
            if (err) throw err;
            console.log("Connected!");

            let sql = `SELECT driver_id, first_name, last_name, produce_item, phone_number, license_plate
                        FROM drivertable
                        ORDER BY driver_id`;

            conn.query(sql, function (err, rows, fields) {
                if (err) throw err;
                //res.send(rows);
                conn.end();
                resolve(rows);
            });

        });//connect
    });//promise
}

function getUsers() {

    let conn = dbConnection();

    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
            if (err) throw err;
            console.log("Connected!");

            let sql = `SELECT * FROM usertable`;
            conn.query(sql, function (err, rows, fields) {
                if (err) throw err;
                conn.end();
                resolve(rows);
            });

        }); //connect
    }); //promise
}




function isAuthenticated(req, res, next){
    if(!req.session.authenticated) res.redirect('/login');
    else next();
}

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