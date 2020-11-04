const express = require("express");
const mysql   = require("mysql");
const app = express();
const session = require('express-session');


app.set("view engine", "ejs");
app.use(express.static("public")); //folder for img, css, js

app.use(express.urlencoded()); //use to parse data sent using the POST method
app.use(session({ secret: 'secret', cookie: { maxAge: 1000 * 60 * 5 }}));
app.use(function(req, res, next) {
    res.locals.isAuthenticated = req.session.authenticated;
    next();
});
app.get("/driver", async function(req,res){
    res.render("driver");
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
app.get("/notAdmin", async function(req,res){
    let driverList = await getDriverList();
    res.render("showNoEdit", {"driverList":driverList});
});

app.get("/database", async function(req,res){
    let driverList = await getDriverList();
    res.render("database", {"driverList":driverList});
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

app.get("/",async function(req,res){
   res.render("drivOrAdm");
});
app.get("/home", async function(req, res){
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

app.post("/loginProcess", async function(req,res){
    //console.log(req.body.username);

    let resultPass = await getPassword(req.body.password);
    let resultUser = await  getUsername(req.body.username);

    let password = "";
    let username = "";
    if(resultPass.length > 0){
        password = resultPass[0].password;
    }
    if(resultUser.length > 0){
        username = resultUser[0].username;
    }
    if(req.body.username == username && req.body.password == password){
        req.session.authenticated = true;
        req.send({"loginSuccess" : true});
    }
    else{
        res.send(false);
        //console.log("fail");
    }
});
function getPassword(password){
    let conn = dbConnection();

    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
            if (err) throw err;
            console.log("Connected!");

            let sql = `SELECT *
                      FROM userTable
                      WHERE password = ?`;

            conn.query(sql, [password], function (err, rows, fields) {
                if (err) throw err;
                //res.send(rows);
                conn.end();
                resolve(rows);
            });

        });//connect
    });//promise
}
function getUsername(username){
    let conn = dbConnection();

    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
            if (err) throw err;
            console.log("Connected!");

            let sql = `SELECT *
                      FROM userTable
                      WHERE username = ?`;

            conn.query(sql, [username], function (err, rows, fields) {
                if (err) throw err;
                //res.send(rows);
                conn.end();
                resolve(rows);
            });

        });//connect
    });//promise
}

function getAdminStatus(admin){
    let conn = dbConnection();

    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
            if (err) throw err;
            console.log("Connected!");

            let sql = `SELECT *
                      FROM userTable
                      WHERE userTable.admin = ?`;

            conn.query(sql, [admin], function (err, rows, fields) {
                if (err) throw err;
                //res.send(rows);
                conn.end();
                resolve(rows);
            });

        });//connect
    });//promise
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