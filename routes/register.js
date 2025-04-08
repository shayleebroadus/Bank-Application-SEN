var express = require('express');
var router = express.Router();
var dbCon = require('../lib/database');

/* GET page. */
router.get('/', function(req, res, next) {
    console.log("register.js: GET");
    res.render('register', { });
});

/* POST page. */
router.post('/', function(req, res, next) {
    
    console.log("register.js: POST");

    const username = req.body.username;
    const salt = req.body.salt;
    const hash = req.body.hash;
    const name = req.body.name;
    const email = req.body.email;
    const address = req.body.address;
    const phone = req.body.phone;
    const gender = req.body.gender;
    const birthdate = req.body.birthdate;

    console.log("register.js: username: "+ username + "\n hash: " + hash+"\n salt: "+ salt + 
    "\n name: " + name+ "\n and more");
    let sql = "CALL insert_user(?, ?, ?, ?, ?, ?, ?, ?, ?, 'customer', @result); SELECT @result";
    dbCon.query(sql, [username, hash, salt, name, email, address, phone, gender, birthdate], function(err, rows){
        if (err){
            throw err;
        }
        if(rows[1][0]['@result'] == 0){
            console.log('\n\n\nsuccessful registration\n\n\n')

            //set the session variable for this
            req.session.username = username;
            req.session.loggedIn = true;

            //session updates are not synchronous and automatic because they are inserted into 
            //the MySQL database we have to wait for the database to come back with a result
            //req.session.save() will trigger a function when the save completes

            req.session.save(function(err){
                if(err){
                    throw err;
                }
                console.log("Successfull Registration! A session field is: " + req.session.username);

                //redirect the user to the home page.   let that redirect the user to the next correct spot
                res.redirect('/');

            });
        }else{
            console.log("register.js: The username already exists, reload register page with that message.");
            res.render('register', {message: "The username '" + username + "' already exists"});
            
        }
    });
});

module.exports = router;