var express = require('express');
var router = express.Router();

var dbCon = require("../lib/database");

/* GET page. */
router.get('/', function(req, res, next) {
    console.log("loginuser.js: GET");
    res.render('loginuser', { });
});

/* POST page. */
router.post('/', function(req, res, next) {
    console.log("loginuser.js: POST");
    //res.render('loginpassword', { });

    if(req.body.hashedPassword){
        //user submitted password
        console.log("loginuser.js: Password Post has received and attempting to check Password");
        const username = req.session.username;
        const hashpass = req.body.hashedPassword;

        console.log("querying account: ")
        const sql = "CALL check_credentials('" + username+"', '" + hashpass + "')";
        console.log("___" +sql);
        dbCon.query(sql, function(err, results){
            if(err){
                throw err;
            }
            console.log("loginuser.js: obtained check credential results from DB");
            if(results[0][0].result === undefined || results[0][0].result==0){
                console.log("loginuser.js: No login Credentials found");
                res.render('loginuser', {message: "Password not valid for  username '"+
            username + "', Please log in again"});
            }
            else{
                console.log("loginuser.js: Credentials matched")
                req.session.loggedIn = true;
                return res.redirect("/");
            }
        });//query
    }//password post
    else if(req.body.username!=""){
        const username = req.body.username;

        const sql = "CALL get_salt('"+username+"')";
        dbCon.query(sql, function(err, results){
            if(err){
                throw err;
            }
            if(results[0][0] === undefined){
                console.log("loginUser.js: No results found");
                res.render('loginuser', {message: "User '"+ username+ "' Not Found"});
            }
            else{
                const salt = results[0][0].salt;
                req.session.username = username;
                req.session.salt = salt;
                res.render('loginpassword', 
                {username: username, 
                salt: salt});
            }
            
        });//query

    }// if username and not logged in
});

module.exports = router;

