var express = require('express');
var router = express.Router();
var dbCon = require('../lib/database')

function update(req, res, currUsername, val, goal){
  console.log("successfully sent values and goal?: "+ val.length+ " "+goal)
  if(currUsername && goal>0){
      //update username
      let num= 0;
      if(val[0]){
        let sql = "CALL updateInfo(?, 'username', ?, @result); SELECT @result;";

        dbCon.query(sql, [currUsername, val[0]], function(err, rows){
          if (err){
              throw err;
          }
          if(rows[1][0]['@result'] == 0){
              console.log('\n\n\n Successful username update\n\n\n')
            req.session.username = val[0];
            num++;
          }
          updateName(req, res, val, num)
        });//end query
      }//if username
      else{ updateName(req, res, val, num)}

        function updateName(req, res, val, num){
          if(val[1]){
            //update name
            sql = "CALL updateInfo(?, 'name', ?, @result); SELECT @result";

            dbCon.query(sql, [req.session.username, val[1]], function(err, rows){
              if (err){
                throw err;
              }
              if(rows[1][0]['@result'] == 0){
                console.log('\n\n\nsuccessful name udpate\n\n\n')
                num++;
              }
              updateEmail(req, res, val, num)
            });//end query
          }//if name
          else{updateEmail(req, res, val, num)}
        }

        function updateEmail(req, res, val, num){
          if(val[2]){
                //update email
                sql = "CALL updateInfo(?, 'email', ?, @result); SELECT @result";

                dbCon.query(sql, [req.session.username, val[2]], function(err, rows){
                  if (err){
                      throw err;
                  }
                  if(rows[1][0]['@result'] == 0){
                      console.log('\n\n\nsuccessful email update\n\n\n')
                      num++;
                    updateAddress(req, res, val, num)
                  }
                });//end query
              }
              else{updateAddress(req, res, val, num)}
        }

        function updateAddress(req, res, val, num){
          if(val[3]){
            sql = "CALL updateInfo(?, 'address', ?, @result); SELECT @result";

            dbCon.query(sql, [req.session.username, val[3]], function(err, rows){
              if (err){
                throw err;
              }
              if(rows[1][0]['@result'] == 0){
                console.log('\n\n\nsuccessful address update\n\n\n')
                num++;
              }
              updatePhone(req, res, val, num)
            });//end query
          }//end if
          else{updatePhone(req, res, val, num)}
        }

        function updatePhone(req, res, val, num){
            if(val[4]){
                //update phone
              sql = "CALL updateInfo(?, 'phone', ?, @result); SELECT @result";

              dbCon.query(sql, [req.session.username, val[4]], function(err, rows){
                if (err){
                  throw err;
                }
                if(rows[1][0]['@result'] == 0){
                  console.log('\n\n\nsuccessful phone update\n\n\n')
                  num++;
                }
                RenderFromUpdate(req, res, num)
              });//end query
            }// end if
            else{RenderFromUpdate(req, res, num)}
        }

        function RenderFromUpdate(req, res, num){
          console.log("finished -> updates: "+ num + "->" + goal);
          if(num==goal){
          console.log("successfully finished all updates")
          res.redirect('/'+ req.session.prevPage)
          }
          else{console.log("somethings broken")
          res.render('updateinfo', {})}
        }


    }// end if goal>0
    else{res.redirect('/'+ req.session.prevPage)}
    
  }//end function 

/* GET changepassword page. */
router.get('/', function(req, res, next) {
  res.render('updateinfo', {});
});

router.post('/', function(req, res, next) {
    
  console.log("updateinfo.js: POST");


  const currUsername = req.body.currUsername;
  const username = req.body.username;
  const name = req.body.name;
  const email = req.body.email;
  const address = req.body.address;
  const phone = req.body.phone;
  const prevPage = req.session.prevPage;

  console.log("updateinfo.js: changing info....");

  let values=[username, name, email, address, phone];
  let updates = 0;
  for (var i = 0; i < values.length; i++){
    if(values[i]){
      updates++;
    }
  }
  update(req, res, currUsername, values, updates)

}); //END POST 

module.exports = router;