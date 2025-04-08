var express = require('express');
var router = express.Router();
var dbCon = require("../lib/database")

function renderCustomerPage(req, res, user, acc){
  /*
      1. get activities
      3. set currAcc and AccID
      2. get act num
      4. get total
    */
  
      let data=[];
  
      //#1- get activities
    
      if(user){
         //set the current account for easy access
         req.session.currAcc = acc;
         //get activities to post to table
         let sql = "CALL get_activities(?, ?);"
         dbCon.query(sql, [user, acc],function(err, rows){
           if(err){
             console.log(err.message);
             throw err;
           }
           //set activities to data.activities
           data.activities = rows[0];
           if(data.activities.length>0){
             console.log("get act true")
             getact = true;
           }
     
           //check the length of rows[0]
           console.log("Rows[0]: "+rows[0].length)
     
           //check the length of data.activities
           console.log("Activities.length: "+ data.activities.length)
     
           //#2
           if(acc=='c'){
            data.currAcc = 'Checking';
           }
           else{
            data.currAcc = 'Saving';
           }
           if(rows[0].length){
            data.AccID = rows[0][0].accID;
            req.session.AccID = rows[0][0].accID;

           }
           else{data.AccID = ""}
           
       
           
           getAccountTotal(res, data)
         });//query
         
      }//end if user
    
      //#4 get total
      function getAccountTotal(res, data){
        let sql = "CALL get_total('"+user+"', '"+req.session.currAcc+"');"
    
        dbCon.query(sql, function(err, rows){
          if(err){
              console.log(err.message);
              throw err;
          }
          
          //set total 
          data.total = "Account Total: $"+rows[0][0]['total']; 
        
          //check that total is valid
          console.log("\n\ntotal?  \t\t"+ data.total);
          
          RenderHome(res)
        });//total query
    
      }

  function RenderHome(res){
    console.log("customerhome.js-> RenderHome: rendering page with data")
    console.log(data.activities.length)
    res.render("customerhome", data);

  }

}


function addAct(req, res){
  /*
  get variables
  call add_activity(username, amount, accID, type, memo)
  update total for the account
  refresh records (call renderCustomerPage)
  */

  const username = req.session.username;
  const amt = req.body.amount;
  const acc = req.body.account; //'c' or 's'
  const type = req.body.type;
  const memo = req.body.memo;

  // get accID 
  let sql = "CALL getAccID(?, ?);"

  dbCon.query(sql, [username, acc], function(err, rows){
    if(err){
      throw err;
    }

    let accID = rows[0][0].accID;
    let sql = "CALL addActivity(?, ?, ?, ?, ?);"

    dbCon.query(sql, [username, amt, accID, type, memo], function(err){
      if(err){
        throw err;
      }
      updateTotal(req, res, username, accID)
    });

  });
  

  function updateTotal(req, res, user, accID){

    //get id by username, then call updateTotal
    let sql = "CALL getIDByUsername(?);"

    dbCon.query(sql, [user, accID], function(err, rows){
      if(err){
        throw err;
      }

      let ID = rows[0][0].id;

      let sql = "CALL updateTotal(?, ?);"
      dbCon.query(sql, [ID, accID], function(err){
        if(err){
          throw err;
        }
        renderCustomerPage(req, res, user, req.session.currAcc);
      }); //end query
    }); //end query

    
  }
}


/* GET home page. */
router.get('/', function(req, res, next) {
  //get accounts info 

  let user = req.session.username;
  console.log("\n\ncurrent user: "+ user + "\n\n")
  if(user){
    renderCustomerPage(req, res, user, 'c');
  }//end if(user) for getting activities
  else{
    res.redirect('/loginuser', {message: "Unable to login at this time"})
  }
});//END GET

router.post('/', function(req, res, next) {
    
  console.log("customerhome.js: POST");

  const filter = req.body.filter            //change from savings or checkings view
  const add= req.body.transfer              //add an activity
  const view = req.body.profile             //send to update info
  const changePass = req.body.changePass    //send to change pass

  //console.log("checking filters: " +filter+add+view+changePass)
  //check filter
  if(filter){
    console.log("customerhome.js: filtering records")
    renderCustomerPage(req, res, req.session.username, req.body.Account)
  }

  //check add activity
  if(add){
    console.log("customerhome.js: loading transfer")
    addAct(req, res)
  }

  //check view profile
  if(view){
    console.log("customerhome.js: Routing to profile")
    req.session.prevPage = 'customerhome'
    res.redirect('/updateinfo')
  }

    //check changePassword
  if(changePass){
    //set session variable
    console.log("customerhome.js: set variable and routing to change pass")
    req.session.prevPage='customerhome'
    res.redirect('/changepassword')

  }

  //res.render('customerhome');

}); //END POST 





module.exports = router;
