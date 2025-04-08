var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('employeeHome.js: Getting customer records')

  if(!req.session || !req.session.loggedIn ){
    console.log("employeehome.js: redirecting to index")
    res.redirect("/")
  }
  else{
    console.log("Fetching Account Records")
  let sql = "CALL getAccounts();"

  dbCon.query(sql, function(err, rows){
    if(err){
      throw err;
    }
    res.render('employeehome', {data: rows[0]});
  });
}

  

});


//POST 
// /* POST page. */
router.post('/', function(req, res, next) {
  
  const select = req.body.select;
 //check if select 
 if(select){
  const user = req.body.selected;   //user_id
  req.session.custInfo = user;      //session variable holding the user ID for the selected account to view
  console.log("user from button: "+ user)
  res.redirect("/customerInfo")
 }
  console.log("employeehome.js: POST");
  res.render('employeehome', {data:0});
});

module.exports = router;
