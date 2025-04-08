let mysql= require('mysql2');

var dbConnectionInfo = require("./connectionInfo");

var con = mysql.createConnection({
    host: dbConnectionInfo.host,
    user: dbConnectionInfo.user,
    password: dbConnectionInfo.password,
    port: dbConnectionInfo.port, 
    multipleStatements: true
});

console.log("Attempting Connection: ...");
con.connect(
    function(err)
    {
        if (err){
            throw err;
        }
        else{
            console.log("database.js: Connection Successful");
            con.query("CREATE DATABASE IF NOT EXISTS Bank;", 
            function(err, result)
            {
                if(err){
                    console.log(err.message);
                    throw err;
                }
                console.log("database.js: Bank Database Created!");
                selectDatabase();
            });
        }
    });
    //
    function selectDatabase() {
        let sql = "USE bank";
        con.query(sql, function(err, results, fields) {
          if (err) {
            console.log(err.message);
            throw err;
          } else {
            console.log("database.js: Selected bank database");
            
            //where to call these functions!
            createTables();
            createStoredProcedures();
            addTableData();
          }
        });
    }


    function createTables(){
        //User

            let sql = "CREATE TABLE IF NOT EXISTS user (\n" +
                "user_id INT NOT NULL AUTO_INCREMENT,\n" +
                "username VARCHAR(255) NOT NULL,\n" +
                "hashed_password VARCHAR(255) NOT NULL,\n" +
                "salt VARCHAR(255) NOT NULL,\n" +
                "name VARCHAR(255) NOT NULL, \n"+
                "DOB DATE NOT NULL, \n"+
                "email VARCHAR(255) NOT NULL, \n"+
                "address VARCHAR(255) NOT NULL, \n" +
                "phone VARCHAR(15) NOT NULL, \n"+
                "gender VARCHAR(20) NOT NULL, \n"+
                "PRIMARY KEY (user_id) \n"+
              ")";
            con.execute(sql, function(err, results, fields) {
            if (err) {
                console.log(err.message);
                throw err;
            } else {
                console.log("database.js: table users created if it didn't exist");
            }
            });
        


        //user_type
            sql="CREATE TABLE IF NOT EXISTS user_type (\n" +
            "typeID int NOT NULL AUTO_INCREMENT, \n"+
            "user_id int NOT NULL, \n"+
            "type VARCHAR(10) NOT NULL, \n"+
            "PRIMARY KEY (typeID), \n"+
            "FOREIGN KEY (user_id) REFERENCES user(user_id) \n"+
            ")";
            
            con.execute(sql, function(err, results, fields) {
                if (err) {
                    console.log(err.message);
                    throw err;
                } else {
                    console.log("database.js: table user_type created if it didn't exist");
                }
                });
        


 

        //account
            sql = "CREATE TABLE IF NOT EXISTS account (\n" +
            "accID INT NOT NULL AUTO_INCREMENT, \n"+
            "custID INT NOT NULL, \n"+
            "acc_type CHAR(1), \n"+
            "total int, \n"+
            "PRIMARY KEY (accID), \n"+
            "FOREIGN KEY (custID) REFERENCES user(user_id) \n"+
            ")";



            con.execute(sql, function(err, results, fields) {
            if (err) {
                console.log(err.message);
                throw err;
            } else {
                console.log("database.js: table account created if it didn't exist");
            }
            });





        //Activity
            sql = "CREATE TABLE IF NOT EXISTS activity (\n" +
            "actID INT NOT NULL AUTO_INCREMENT, \n"+
            "accID INT NOT NULL, \n"+
            "date DATE NOT NULL, \n"+
            "amount FLOAT NOT NULL, \n"+
            "type VARCHAR(15) NOT NULL, \n"+
            "memo VARCHAR(300) , \n"+
            "PRIMARY KEY (actID) , \n"+
            "FOREIGN KEY (accID) REFERENCES account(accID) \n"+
            ")";



            con.execute(sql, function(err, results, fields) {
            if (err) {
                console.log(err.message);
                throw err;
            } else {
                console.log("database.js: table Activity created if it didn't exist");
            }
            });

    }

    function createStoredProcedures(){

        
         //procedure update to employee and delete any accounts
        let sql = "CREATE PROCEDURE IF NOT EXISTS `updateToAdmin` (\n"+
        "IN username VARCHAR(255) \n"+
        ") \n"+
        "BEGIN \n"+
        "   DECLARE refID INT DEFAULT 0;\n"+
            "SELECT user_id INTO refID FROM user WHERE user.username = username; \n"+
            "IF refID IS NOT NULL THEN \n"+
                "UPDATE user_type \n"+
                "SET type = 'admin'\n"+
                "WHERE user_type.user_id = refID; \n"+
                "DELETE FROM account WHERE custID = refID; \n"+
            "END IF; \n"+
        "END;"
        
        con.query(sql, function(err, results, fields) {
            if (err) {
              console.log(err.message);
              throw err;
            } else {
              console.log("database.js: procedure updateToAdmin created if it didn't exist");
            }
          });

  
          sql = "CREATE PROCEDURE IF NOT EXISTS `updateToEmployee` (\n"+
          "IN username VARCHAR(255) \n"+
          ") \n"+
          "BEGIN \n"+
          "   DECLARE refID INT DEFAULT 0;\n"+
              "SELECT user_id INTO refID FROM user WHERE user.username = username; \n"+
              "IF refID IS NOT NULL THEN \n"+
                  "UPDATE user_type \n"+
                  "SET type = 'employee'\n"+
                  "WHERE user_type.user_id = refID; \n"+
                  "DELETE FROM account WHERE custID = refID; \n"+
              "END IF; \n"+
          "END;"
          
          con.query(sql, function(err, results, fields) {
              if (err) {
                console.log(err.message);
                throw err;
              } else {
                console.log("database.js: procedure updateToAdmin created if it didn't exist");
              }
            });

        //procedure addaccount
        sql = "CREATE PROCEDURE IF NOT EXISTS `addAccounts` (\n"+
        "IN username VARCHAR(255) \n"+
        ") \n"+
        "BEGIN \n"+
            "DECLARE refID INT DEFAULT 0; \n"+
            "DECLARE t VARCHAR(10) DEFAULT ''; \n"+
            "DECLARE nCount INT DEFAULT 0; \n"+
            "SELECT user_ID INTO refID FROM user WHERE user.username = username; \n"+
            "SELECT type INTO t FROM user_type WHERE user_type.user_id = refID; \n" +
            "SELECT COUNT(*) INTO nCount FROM account WHERE account.custID = refID; \n" +
            "IF STRCMP(t, 'customer') =0 AND nCount = 0 THEN \n"+
                "INSERT INTO account (custID, acc_type, total) \n"+
                "VALUES (refID, 'c', 0); \n"+
                "INSERT INTO account (custID, acc_type, total) \n"+
                "VALUES(refID, 's', 0); \n"+
            "END IF; \n"+
        "END;"

        con.query(sql, function(err, results, fields) {
            if (err) {
              console.log(err.message);
              throw err;
            } else {
              console.log("database.js: procedure addAccounts created if it didn't exist");
            }
          });
        
        
        
        //addUser (and customer/employee)
        // " , \n"+
        sql = "CREATE PROCEDURE IF NOT EXISTS `insert_user`(\n" +
                      "IN username VARCHAR(45),\n" +
                      "IN hash VARCHAR(255), \n"+
                      "IN newSalt VARCHAR(255), \n"+
                      "IN name VARCHAR(255), \n"+
                      "IN email VARCHAR(255), \n"+
                      "IN address VARCHAR(255), \n"+
                      "IN phone VARCHAR(15), \n"+
                      "IN gender VARCHAR(20), \n"+
                      "IN dob DATE, \n"+
                      "IN type VARCHAR(10), \n"+
                      "OUT result INT \n"+
                  ")\n" +
                  "BEGIN\n" +
                  "DECLARE nCount INT DEFAULT 0;\n" +
                  "DECLARE refID INT DEFAULT 0; \n"+
                  "SET result = 0;\n" +
                  "SELECT Count(*) INTO nCount FROM user WHERE user.username = username;\n" +
                  "IF nCount = 0 THEN\n" +
                      "INSERT INTO user (username, hashed_password, salt, name, DOB, email, address, phone, gender )\n" +
                      "VALUES (username, hash, newSalt, name, dob, email, address, phone, gender);\n" +
                      "SELECT user_ID INTO refID FROM user WHERE user.username = username; \n"+
                      "IF STRCMP(type, 'customer') = 0 THEN \n"+
                        "INSERT INTO user_type(user_id, type) \n"+
                        "VALUES (refID, type); \n"+
                        "CALL addAccounts(username); \n"+
                      "ELSE \n"+
                        "INSERT INTO user_type(user_id, type) \n"+
                        "VALUES (refID, type); \n"+
                      "END IF;\n"+
                  "ELSE \n" +
                    "SET result=1;\n" +
                  "END IF;\n" +
              "END;"
    
    con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure insert_user created if it didn't exist");
      }
    });

        //update info param = string 
        // " , \n"+
        sql = "CREATE PROCEDURE IF NOT EXISTS `updateInfo` (\n"+
        "IN username VARCHAR(255), \n"+
        "IN ValToChange VARCHAR(15), \n"+
        "IN value VARCHAR(255), \n"+
        "OUT result INT \n"+
        ") \n"+
        "BEGIN \n"+
        "DECLARE refID INT DEFAULT 0; \n"+
        "DECLARE nCount INT DEFAULT 0;\n"+
        "SET result = 0; \n"+
        "SELECT user_id INTO refID FROM user WHERE user.username = username; \n"+
        "CASE \n"+
            "WHEN STRCMP(ValToChange, 'username') = 0 THEN \n"+
                "SELECT COUNT(*) INTO nCount FROM user WHERE user.username = value; \n"+
                "IF nCount = 0 THEN \n"+
                    "UPDATE user \n"+
                    "SET  username = value \n"+
                    "WHERE user.user_id = refID; \n"+
                "ELSE \n"+
                    " SET result = -1; \n"+
                "END IF; \n"+
            "WHEN STRCMP(ValToChange, 'name') = 0 THEN \n"+
                "UPDATE user \n"+
                "SET name = value \n"+
                "WHERE user.user_id = refID; \n"+
            "WHEN STRCMP(ValToChange, 'email') = 0 THEN \n"+
                "UPDATE user \n"+
                "SET email = value \n"+
                "WHERE user.user_id = refID; \n"+
            "WHEN STRCMP(ValToChange, 'address') = 0 THEN \n"+
                "UPDATE user \n"+
                "SET address = value \n"+
                "WHERE user.user_id = refID; \n"+
            "WHEN STRCMP(ValToChange, 'phone') = 0 THEN \n"+
                "UPDATE user \n"+
                "SET phone = value \n"+
                "WHERE user.user_id = refID; \n"+
        "END CASE; \n"+
        "END;"

        con.query(sql, function(err, results, fields) {
            if (err) {
              console.log(err.message);
              throw err;
            } else {
              console.log("database.js: procedure updateInfo created if it didn't exist");
            }
          });




        //changepassword
        sql = "CREATE PROCEDURE IF NOT EXISTS `changePassword` (\n"+
        "IN newhash VARCHAR(255), \n"+
        "IN newsalt VARCHAR(255), \n"+
        "IN username VARCHAR(255) \n"+
        ") \n"+
        "BEGIN \n"+
            "DECLARE refID INT DEFAULT 0;\n"+
            "SELECT user_id INTO refID FROM user WHERE user.username = username;\n"+
            "UPDATE user\n"+
            "SET hashed_password = newhash, salt = newsalt\n"+
            "WHERE user.user_id = refID;\n"+
        "END;"

        con.query(sql, function(err, results, fields) {
            if (err) {
              console.log(err.message);
              throw err;
            } else {
              console.log("database.js: procedure changePassword created if it didn't exist");
            }
          });


          
          
          
          sql = "CREATE PROCEDURE IF NOT EXISTS `updateTotal`(\n"+
          "IN user INT, \n"+
          "IN currAcc INT )\n"+
          "BEGIN\n"+
          "DECLARE t FLOAT DEFAULT 0;\n"+
          "SELECT SUM(amount) INTO t FROM activity \n"+
          "WHERE accID = currAcc;\n"+
          "UPDATE account\n"+
          "SET total = t\n"+
          "WHERE custID = user AND accID = currAcc;\n"+
          "END;"

          con.query(sql, function(err, results, fields) {
            if (err) {
              console.log(err.message);
              throw err;
            } else {
              console.log("database.js: procedure updatetotal created if it didn't exist");
            }
          });


          sql="CREATE PROCEDURE IF NOT EXISTS `handle_transfer`(\n"+
          "IN user INT,\n"+
          "IN currAcc INT, \n"+
          "IN amount INT )\n"+
          "BEGIN\n"+
          "DECLARE oppAcc INT DEFAULT 0;\n"+
          "SELECT accID INTO oppACC FROM account\n"+
          "WHERE custID = user AND accID !=currAcc;\n"+
          "INSERT INTO activity(accID, date, amount, type)  \n"+
          "VALUES (oppAcc, CURDATE(), (-1*amount), 'deposit');\n"+
          "CALL updateTotal(user, currAcc);\n"+
          "END;"

          con.query(sql, function(err, results, fields) {
            if (err) {
              console.log(err.message);
              throw err;
            } else {
              console.log("database.js: procedure handletransfer created if it didn't exist");
            }
          });

          sql = "CREATE PROCEDURE IF NOT EXISTS `getAccID`(\n"+
          "IN username VARCHAR(255), \n"+
          "IN accType VARCHAR(1)\n"+
          ")\n"+
          "BEGIN\n"+
          "SELECT accID FROM account a\n"+
          "JOIN user u on u.user_id = a.custID\n"+
          "WHERE u.username = username\n"+
          "AND a.acc_type = accType;\n"+
          "END";

        con.query(sql, function(err, results, fields) {
        if (err) {
          console.log(err.message);
          throw err;
        } else {
          console.log("database.js: procedure getAccID created if it didn't exist");
        }
      });

        //addActivity
        sql = "CREATE PROCEDURE IF NOT EXISTS `addActivity` (\n"+
        "IN username VARCHAR(255), \n"+
        "IN amount FLOAT, \n"+
        "IN accID INT, \n"+
        "IN type VARCHAR(15), \n"+
        "IN memo VARCHAR(300) \n"+
        ") \n"+
        "BEGIN \n"+
            "DECLARE refID INT DEFAULT 0; \n"+
            "SELECT user_id INTO refID FROM user WHERE user.username = username; \n"+
              "IF STRCMP(type, 'deposit') = 0 THEN \n"+
                  "INSERT INTO activity(accID, date, amount, type)  \n"+
                  "VALUES (accID, CURDATE(), amount, type);\n"+
              "ELSEIF STRCMP(type, 'transfer') = 0 THEN \n"+
                  "INSERT INTO activity(accID, date, amount, type, memo)  \n"+
                  "VALUES (accID, CURDATE(), amount, type, memo);\n"+
                  "CALL handle_transfer(refID, accID, amount);\n"+
              "END IF;\n"+ 
        "END;"

        con.query(sql, function(err, results, fields) {
            if (err) {
              console.log(err.message);
              throw err;
            } else {
              console.log("database.js: procedure addActivity created if it didn't exist");
            }
          });





        //checkUser
        sql = "CREATE PROCEDURE IF NOT EXISTS `check_credentials`(\n" +
        "IN username VARCHAR(255),\n" +
        "IN hashed_password VARCHAR(255)\n" +
        ")\n" +
        "BEGIN\n" +
            "SELECT EXISTS(\n" +
            "SELECT * FROM user\n" +
            "WHERE user.username = username AND user.hashed_password = hashed_password\n" +
            ") AS result;\n" +
        "END;";

        con.query(sql, function(err, results, fields) {
        if (err) {
        console.log(err.message);
        throw err;
        } else {
        console.log("database.js: procedure check_credentials created if it didn't exist");
        }
        });



          sql ="CREATE PROCEDURE IF NOT EXISTS `get_salt`(\n" +
                "IN username VARCHAR(255)\n" +
                ")\n" +
                "BEGIN\n" +
                "SELECT salt FROM user\n" +
                "WHERE user.username = username\n" +
                "LIMIT 1;\n" +
                "END;";

          con.query(sql, function(err, results, fields) {
            if (err) {
              console.log(err.message);
              throw err;
            } else {
              console.log("database.js: procedure get salt created if it didn't exist");
            }
          });



          sql = "CREATE PROCEDURE IF NOT EXISTS `get_user_type`( \n"+
          "IN username VARCHAR(255)\n"+
          ")\n"+
          "BEGIN\n"+
          "SELECT type\n"+
          "FROM user_type ut \n"+
          "JOIN user u ON u.user_id = ut.user_id \n "+
          "WHERE u.username = username;\n"+
          "END;"
          //return column: "type"

          con.query(sql, function(err, results, fields) {
            if (err) {
              console.log(err.message);
              throw err;
            } else {
              console.log("database.js: procedure get user type created if it didn't exist");
            }
          });


          sql = "CREATE PROCEDURE IF NOT EXISTS `get_activities`(\n"+
          "IN username VARCHAR (255),\n"+
          "IN accType VARCHAR(1) ) \n"+
          "BEGIN\n"+
          "DECLARE refID INT DEFAULT 0; \n"+
          "DECLARE refAcc INT DEFAULT 0;\n"+
          "SELECT user_id INTO refID FROM user WHERE user.username = username; \n"+  
          "SELECT accID INTO refAcc FROM account \n"+
          "WHERE custID = refID AND acc_type = accType;\n"+
          "SELECT * FROM activity WHERE accID = refAcc;\n"+
          "END;"


          con.query(sql, function(err, results, fields) {
            if (err) {
              console.log(err.message);
              throw err;
            } else {
              console.log("database.js: procedure get activities created if it didn't exist");
            }
          });

        
        sql = "CREATE PROCEDURE IF NOT EXISTS `get_act_num`(\n"+
        "IN username VARCHAR (255),\n"+
        "IN accType VARCHAR(1) ) \n"+
        "BEGIN\n"+
        "DECLARE refID INT DEFAULT 0; \n"+
        "DECLARE refAcc INT DEFAULT 0;\n"+
        "SELECT user_id INTO refID FROM user WHERE user.username = username; \n"+  
        "SELECT accID INTO refAcc FROM account \n"+
        "WHERE custID = refID AND acc_type = accType;\n"+
        "SELECT COUNT(*) as count FROM activity WHERE accID = refAcc;\n"+
        "END;"

        con.query(sql, function(err, results, fields) {
          if (err) {
            console.log(err.message);
            throw err;
          } else {
            console.log("database.js: procedure get_act_num created if it didn't exist");
          }
        });


        sql = "CREATE PROCEDURE IF NOT EXISTS `get_total`(\n"+
        "IN username VARCHAR (255),\n"+
        "IN currAcc VARCHAR(1))\n"+
        "BEGIN\n"+
        "DECLARE refID INT DEFAULT 0; \n"+
        "DECLARE refAcc INT DEFAULT 0;\n"+
        "SELECT user_id INTO refID FROM user WHERE user.username = username; \n"+  
        "SELECT accID INTO refAcc FROM account \n"+
        "WHERE custID = refID AND acc_type = currAcc;\n"+
        "SELECT total FROM account WHERE custID = refID AND accID = refAcc;\n"+
        "END;"

        con.query(sql, function(err, results, fields) {
            if (err) {
              console.log(err.message);
              throw err;
            } else {
              console.log("database.js: procedure get total created if it didn't exist");
            }
        });



        sql = "CREATE PROCEDURE IF NOT EXISTS `getAccounts`(\n"+
        ") \n"+
        "BEGIN\n"+
        "SELECT user.user_id as user, name, accID, acc_type FROM user "+
        "JOIN user_type ON user.user_id = user_type.user_id "+
        "JOIN account ON user.user_id = account.custID "+
        "WHERE type = 'customer' ;\n"+
        "END;"

        con.query(sql, function(err, results, fields) {
          if (err) {
            console.log(err.message);
            throw err;
          } else {
            console.log("database.js: procedure getAccounts created if it didn't exist");
          }
      });


      sql = "CREATE PROCEDURE IF NOT EXISTS `getByUserID`(\n"+
      "IN userID INT\n"+
      ")\n"+
      "BEGIN\n"+
      "SELECT username FROM user WHERE user_id = userID;\n"+
      "END";

      con.query(sql, function(err, results, fields) {
        if (err) {
          console.log(err.message);
          throw err;
        } else {
          console.log("database.js: procedure getByUserID created if it didn't exist");
        }
    });

     sql = "CREATE PROCEDURE IF NOT EXISTS `getIDByUsername`(\n"+
     "IN user VARCHAR(255)\n"+
     ")\n"+
     "BEGIN\n"+
     "SELECT user_id as id FROM user WHERE username =user;\n"+
     "END;"

     con.query(sql, function(err, results, fields) {
      if (err) {
        console.log(err.message);
        throw err;
      } else {
        console.log("database.js: procedure getIDByUsername created if it didn't exist");
      }
    });

      sql = "CREATE PROCEDURE IF NOT EXISTS `get_profile`(\n"+
      "IN username VARCHAR(255)\n"+
      ")\n"+
      "BEGIN\n"+
      "SELECT name, email, phone, address, gender \n"+
      "FROM user\n"+
      "WHERE user.username = username;\n"+
      "END;"

      con.query(sql, function(err, results, fields) {
        if (err) {
          console.log(err.message);
          throw err;
        } else {
          console.log("database.js: procedure get_profile created if it didn't exist");
        }
      });

    }// end func createStoredProcedures

    function addTableData(){
        // add default admin

        let sql = "CALL insert_user('admin', 'bdb5988588f56994b321e99153f7bb9e6f135d67e8b80371ce25b831d9cfe385', 'ad688f2a33b7a17b', 'MeAdmin Adminton', 'adminton@gmail.com', "+
                    "'123 Apple Lane', '555-555-5555', 'Other', '2001-01-01', 'admin', @result)"
    
                    con.query(sql, function(err){
                        if (err){
                            throw err;
                        }
                        console.log("database.js: Inserted Admin");
                    });

        sql = "CALL updateToAdmin('admin');"

        con.query(sql, function(err){
            if (err){
                throw err;
            }
            console.log("database.js: updated user admin to admin status");
        });


        sql = "CALL insert_user('employee', '1619554ddef3409010f42cb12d152e584eba4bac8f131b445151e054ffa9907a', 'e7c3a90370f74154', 'Eyam Employee', 'Eyam@gmail.com', "+
        "'123 Apple Lane', '555-555-5555', 'Other', '2001-01-01', 'employee', @result)"

        con.query(sql, function(err){
            if (err){
                throw err;
            }
            console.log("database.js: Inserted employee");
        });

        sql = "CALL updateToEmployee('employee');"

        con.query(sql, function(err){
        if (err){
            throw err;
        }
        console.log("database.js: updated user employee to employee status");
        });



  //       const shay = {un: 'shay',
  //       hash: '1619554ddef3409010f42cb12d152e584eba4bac8f131b445151e054ffa9907a', 
  //       salt: 'e7c3a90370f74154', 
  //       name: 'shaybro',
  //       email: 'shaylee@gmail.com', 
  //       address: 'aksjfbajgb',
  //       phone: '(555)-555-5555',
  //       gender: 'Female',
  //       DOB: '2000-01-01',
  //       userType: 'customer'}

  //       dummyRecords(shay);

  //       const bob = {un: 'bob',
  //       hash: '1619554ddef3409010f42cb12d152e584eba4bac8f131b445151e054ffa9907a', 
  //       salt: 'e7c3a90370f74154', 
  //       name: 'BillBo Bob',
  //       email: 'billbobaggins@gmail.com', 
  //       address: 'aksjfbajgb',
  //       phone: '(555)-555-5555',
  //       gender: 'Male',
  //       DOB: '2000-01-01',
  //       userType: 'customer'}

  //       dummyRecords(bob);

  //       const karen = {un: 'karen',
  //       hash: '1619554ddef3409010f42cb12d152e584eba4bac8f131b445151e054ffa9907a', 
  //       salt: 'e7c3a90370f74154', 
  //       name: 'Karen Jensen',
  //       email: 'KarenJ@gmail.com', 
  //       address: 'aksjfbajgb',
  //       phone: '(555)-555-5555',
  //       gender: 'Female',
  //       DOB: '2000-01-01',
  //       userType: 'customer'}
       
  //       dummyRecords(karen);
    
  }// END dummy data function


  //   //hash and salt for password "123"
  //   // HASH: '1619554ddef3409010f42cb12d152e584eba4bac8f131b445151e054ffa9907a'
  //   // SALT: 'e7c3a90370f74154'

  //   //inserts user and fetches account ID's, then calls generateActivities to add records
  //   function dummyRecords(user){

  //     //username, hash, salt, name, email, address, phone, Gender, DOB, usertype, @result
  //     sql = "CALL insert_user(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @result); SELECT @result"

  //     con.query(sql, [user.un, user.hash, user.salt, user.name, user.email, user.address, user.phone, user.gender, user.DOB, user.userType], function(err, rows){
  //         if (err){
  //             throw err;
  //         }
  //         if(rows[1][0]['@result'] == 0)
  //         {console.log("database.js: added user "+user.un+" for testing");}
  //         else{console.log("user: "+user.un+" already exists or there was a problem adding")}
  //         AccountIDs()
  //     });
      
  //     function AccountIDs(){
  //       //get acc ID for checking
  //       let checkID = -1;
  //       sql = "CALL getAccID(?, 'c');"

  //       con.query(sql, [user.un], function(err, rows){
  //         if (err){
  //             throw err;
  //         }
  //         checkID = rows[0][0].accID;

  //         let sql = "CALL getAccID(?, 's');"
  //         con.query(sql, [user.un], function(err, row){

  //           saveID = row[0][0].accID;

  //           generateActivities(user, checkID, saveID)
  //         })//end inner query
          

  //       });
          
              
  //     } // end func AccountIDs
              
  //   } // END dummyrecords

  //   function generateActivities(user, checkID, saveID){

  //     //add random activities
  //     if(checkID >0 && saveID > 0 && checkID != saveID){
  //         for(var i =0; i < 5; i++){
  //         //username   *random*  *account* type memo
  //           sql = "CALL addActivity(?,(0+RAND()*(3000-1)), ?, 'deposit', NULL);"
            
  //           con.query(sql, [user.un, checkID], function(err){
  //           if (err){
  //               throw err;
  //           }
  //           });

  //           sql = "CALL addActivity(?,(0+RAND()*(3000-1)), ?, 'deposit', NULL);"
            
  //           con.query(sql, [user.un, saveID], function(err){
  //           if (err){
  //               throw err;
  //           }
  //           });


  //           sql = "CALL addActivity(?,(0+RAND()*(100-0)), ?, 'transfer', 'sdlkjfnsdg');"
            
  //           con.query(sql, [user.un, checkID], function(err){
  //           if (err){
  //               throw err;
  //           }
  //           });

  //           sql = "CALL addActivity(?,(0+RAND()*(100-0)), ?, 'transfer', 'askjfbsdg ;ad');"
            
  //           con.query(sql, [user.un, saveID], function(err){
  //           if (err){
  //               throw err;
  //           }
  //           });


  //       } // end for loop

  //       console.log("added activities for test accounts")
  //       //get userID
  //       sql = "CALL getIDByUsername(?);"
  //       let userID = -1;
  //       con.query(sql, [user.un], function(err, rows){
  //         if(err){throw err;}
  //         userID = rows[0][0].id;


  //         //update totals for both accounts
  //       if(userID > 0){
  //         sql ="call updateTotal(?, ?);"

  //         con.query(sql, [userID, checkID], function(err){
  //             if (err){
  //                 throw err;
  //             }
  //             console.log("database.js: updated user "+user.un+" totals for testing");
  //         });

  //         sql = "call updateTotal(?, ?);"

  //         con.query(sql, [userID, saveID], function(err){
  //           if (err){
  //               throw err;
  //           }
  //           console.log("database.js: updated user "+user.un+" totals for testing");
  //         });
          
  //       } // userID> 0?

  //       });
        
  //   } // checkID and saveID >0?

  // }//end generateActivities

    module.exports = con;