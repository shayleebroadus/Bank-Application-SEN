var express = require('express');
var router = express.Router();

var dbCon= require('../lib/database')

function checkUserType(req, res, method){
  //returns a string telling the accessing user type
  let sql = "CALL get_user_type(?);"
  let type = "";

  dbCon.query(sql, [req.session.username],function(err, rows){
    if(err){
      throw err;
    }
    type = rows[0][0].type;
    console.log("username: "+ req.session.username+ "\t user type: "+ type)

    if(type== "employee" && method== 'get'){
      //get the records
      getRecords(req, res, req.session.custInfo, 'c')
      //res.render('customerInfo', {});
    }
    else if(type=='employee' && method=='post' ){
      if(req.body.changePass){
        req.session.prevPage = 'customerInfo'
        getRecords(req, res, req.session.custInfo, req.body.Account)
      }
      else if(req.body.profile){
        req.session.prevPage = 'customerInfo'
        res.redirect("/updateinfo");
      }
      else{
        getRecords(req, res, req.session.custInfo, req.body.Account)
      }
    }
    else if(type=="admin" && method=='get'){
        //no visible records
        console.log("passing in: "+req.session.custInfo)
        profileInfo(req, res, req.session.custInfo)
    }
    else if(type=="admin" && method=='post'){
      //can change password
      if(req.body.changePass){
        req.session.prevPage = "customerInfo"
        res.redirect('/changepassword')
      }
      else if(req.body.profile){
        req.session.prevPage = "customerInfo"
        res.redirect('/updateInfo')
      }
      else{ 
        profileInfo(req, res, req.session.custInfo)
      }
    }
  });//end query

  
}//end user type function

function getRecords(req, res, userID, acc){
  //should be the same from customer home?
    /*
      1. get activities
      3. set currAcc and AccID
      2. get act num
      4. get total
    */
    let data=[];
  
    if(acc == undefined){
      acc = 'c'
      req.session.currAcc = acc;
    console.log("userID: " + userID + "\t Account To View: "+ acc);
    //#0.5 get username from userID

    let sql ="CALL getByUserID(?);"

    dbCon.query(sql, [userID], function(err, rows){
      if(err){
        throw err;
      }
      let user = rows[0][0].username;
      getActivities(user, res)
    });//end query
    }
    else{
      req.session.currAcc = acc;
    console.log("userID: " + userID + "\t Account To View: "+ acc);
    //#0.5 get username from userID

    let sql ="CALL getByUserID(?);"

    dbCon.query(sql, [userID], function(err, rows){
      if(err){
        throw err;
      }
      let user = rows[0][0].username;
      getActivities(user, res)
    });//end query
    }
    

    function getActivities(user, res){
          //#1- get activities
  
    if(user){
       //get activities to post to table
       if(acc== undefined){
        acc = 'c';
       }
       let sql = "CALL get_activities('"+user+"', '"+acc+"');"
       dbCon.query(sql, function(err, rows){
         if(err){
           console.log(err.message);
           throw err;
         }
         //set activities to data.activities
         data.activities = rows[0];
         if(data.activities.length>0){
           console.log("get act length true")
         }
  
         //#2
         if(acc == 'c'){
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
      
         getAccountTotal(res, user)
       });//query
       
    }//end if user
    } // end getActivities
  
    //#4 get total
    function getAccountTotal(res, user){

      let sql = "CALL get_total('"+user+"', '"+req.session.currAcc+"');"
  
      dbCon.query(sql, function(err, rows){
        if(err){
            console.log(err.message);
            throw err;
        }
        
        //set total to variable in data[]
        data.total = "Account Total: $"+rows[0][0]['total']; 
      
        //check that total is valid
        console.log("\n\ntotal?  \t\t"+ data.total);
        
        employeeprofileInfo(req, res, user)
      });//total query
  
    }

   function employeeprofileInfo(req, res, user){
    let sql = "CALL get_profile(?);"

    dbCon.query(sql, [user], function(err, rows){
      if(err){throw err;}
      data.name=rows[0][0].name;
      data.email = rows[0][0].email;
      data.phone= rows[0][0].phone;
      data.address= rows[0][0].address;
      data.gender= rows[0][0].gender;
      RenderHome(res, data)
    })
   }

   function RenderHome(res, data){
    res.render("customerInfo", data)
   }

}// end getRecords

function profileInfo(req, res, userID){
  //returns an array of items that fill the personal data of the accessed file

  let data=[];
  let sql ="CALL getByUserID(?);"
    dbCon.query(sql, [userID], function(err, rows){
      if(err){
        throw err;
      }
      let user = rows[0][0].username;
      console.log("retrieved user: "+ user)
      getdetails(req, res, user)
    });//end query

  function getdetails(req, res, user){
    let sql = "CALL get_profile(?);"

    dbCon.query(sql, [user], function(err, rows){
      if(err){throw err;}
      data.name=rows[0][0].name;
      data.email = rows[0][0].email;
      data.phone= rows[0][0].phone;
      data.address= rows[0][0].address;
      data.gender= rows[0][0].gender;
      adRenderHome(res)
    })
  }
  function adRenderHome(res){
    data.activities = [];
    console.log("admin activity length: " +data.activities.length)
    res.render("customerInfo", data)
  }
}

/* GET home page. */
router.get('/', function(req, res, next) {

  checkUserType(req, res, 'get');

}); //END GET


router.post('/', function(req, res, next) {

  checkUserType(req, res, 'post')

});// END POST 

module.exports = router;
