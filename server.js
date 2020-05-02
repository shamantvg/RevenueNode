const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const app = express();
const mysql = require('mysql');

// Body Parser Middleware
app.use(bodyParser.json());

//CORS Middleware
app.use(function(req, res, next) {
    //Enabling CORS 
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
    next();
});

//Setting up server
var server = app.listen(process.env.PORT || 8080, function() {
    var port = server.address().port;
    console.log("App now running on port", port);
});

//Initiallising conn string

const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'revenue',
    multipleStatements: true
});

//connect to database
conn.connect((err) => {
    if (err) throw err;
    console.log('Mysql Connected...');
});

function verifyToken(req, res, next) {
    if (!req.headers.authorization) {
        return res.status(401).send('Unauthorized request.');
    }
    let token = req.headers.authorization.split(' ')[1];
    if (token === 'null') {
        return res.status(401).send('Unauthorized request.');
    }
    let payload = jwt.verify(token, 'ceaedca7f78911ed3f36118a1b958cc5');
    //console.log("log--->" + payload);
    if (!payload) {
        return res.status(401).send('Unauthorized request.');
    }
    req.userId = payload.subject;
    next();

}
//employeeAuth
app.post('/employeeAuth', (req, res) => {

    var adminId = req.body.adminId;
    var pswd = req.body.pswd;

    let sql = "SELECT E.id,E.loginAccess,E.adminAccess FROM users E WHERE E.adminId = '" + adminId + "' AND E.password = '" + pswd + "' LIMIT 1";
    let query = conn.query(sql, (err, results) => {
        if (err) {
            //throw err;
            console.log(err);
        } else {
            //console.log("length--->" + results.length);
            if (results.length > 0) {
                //console.log("res-->" + results[0].id);
                let payload = { subject: results[0].id };
                let loginAccess = results[0].loginAccess;
                let adminAccess = results[0].adminAccess;
                let token = jwt.sign(payload, 'ceaedca7f78911ed3f36118a1b958cc5') //shamantapi
                res.status(200).send({ token, loginAccess, adminAccess });
            } else {
                res.status(401).send("Invalid request");
            }

        }
        //res.status(200).send(results);

        //res.send(JSON.stringify({ "status": 200, "error": null, "response": results }));
    });
});



//check seesion token
app.get('/CheckSessionToken', verifyToken, (req, res) => {

    res.status(200).send(JSON.stringify({ "status": "200" }));
});


//get graph data
app.get('/getRevenueData', verifyToken, (req, res) => {
    let contentRes = [{
        name: 'John',
        data: [50, 30, 40, 70, 20]
    }, {
        name: 'Jane',
        data: [20, 20, 30, 20, 5]
    }];

    let xRes = {
        categories: ['January', 'Febuary', 'March', 'April', 'May']
    };

    res.status(200).send({ contentRes, xRes });
});