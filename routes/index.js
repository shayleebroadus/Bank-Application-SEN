var express = require('express');
var router = express.Router();

var dbCon = require("../lib/database")

/* GET home page. */
router.get('/', function(req, res, next) {

  console.log("_____logged in?: "+ req.session.loggedIn)
  if(req.session.loggedIn==true){
    const user = req.session.username;
    //get the users type to direct to their home page
    let sql = "CALL get_user_type('"+user +"');"
    dbCon.query(sql, function(err, results){
      if(err){
          throw err;
      }
      if(results[0][0] === undefined || results[0][0].result==0){
          console.log("loginUser.js: unable to load page");
          res.render('index', { });
      }
      else{
          const type = results[0][0].type;
          
          if(type =="customer"){
            console.log("user type: "+ type);
            //req.session.userType = type;
            res.redirect('/customerhome');
          }
          else if(type =="employee"){
            console.log("user type: "+ type);
            //req.session.userType = type;
            res.redirect('/employeehome');
          }
          else if(type =="admin"){
            console.log("user type: "+ type);
            //req.session.userType = type;
            res.redirect('/employeehome');
          }
         
      }
      
    });//query
    //res.redirect('/');
  }
  else{
      res.render('index', { title: 'Express' });
  }

});

router.get('/logout', function(req, res){

  req.session.destroy(function(err){
    if(err){
      throw err;
    }
    else{
      res.redirect('/');
    }
  }); //destroy function
});//routerget

module.exports = router;
