var express = require('express');
var router = express.Router();

var dbCon = require('../lib/database');

/* GET changepassword page. */
router.get('/', function(req, res, next) {
  res.render('changepassword', {});
});

router.post('/', function(req,res,next) {

  console.log("changePassword.js: POST");

  const salt = req.body.salt;
  const hash = req.body.hash;
  const username = req.session.username;

  console.log("Attempting password update")
  if(req.session.prevPage =='customerInfo'){
    //use req.session.custInfo // user_id
    getUser(req, res, req.session.custInfo);
  }
  else{
    let sql = "CALL changePassword(?, ?, ?)";

    dbCon.query(sql, [hash, salt, username], function(err, rows){
      if (err){
          throw err;
      }
      console.log('\n\n\nsuccessful password update\n\n\n')

      //redirect the user to the past page.   let that redirect the user to the next correct spot
      //////////////////////////////////////////////res.redirect('/');
      res.redirect('/'+ req.session.prevPage)

      });//end db query
  }

  function getUser(req, res, ID){
    let sql = "CALL getByUserID(?)"

    dbCon.query(sql, [ID], function(err, rows){
      if(err){
        throw err;
      }

      let user = rows[0][0].username;
      let sql = "CALL changePassword(?, ?, ?)";

      dbCon.query(sql, [hash, salt, user], function(err, rows){
        if (err){
            throw err;
        }
        console.log('\n\n\nsuccessful password update\n\n\n')
  
        //redirect the user to the past page.   let that redirect the user to the next correct spot
        //////////////////////////////////////////////res.redirect('/');
        res.redirect('/'+ req.session.prevPage)
  
        });//end db query

    })//end query
  }
  
});// end post

module.exports = router;