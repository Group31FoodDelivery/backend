const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const { v4: uuidv4 } = require('uuid');
const passport = require('passport');
const customer = require('./modules/users');
const bcrypt = require('bcryptjs');

const BasicStrategy = require('passport-http').BasicStrategy;

const multer = require('multer');
const upload = multer({ dest: 'uploads/'})
 
const connectio = mysql.createPool({
  host     : 'yummygo.mysql.database.azure.com',
  user     : 'Darkstratocaster@yummygo',
  password : 'Yummygoadmin123',
  database : 'mydb',
  acquireTimeout: 600
});

connectio.getConnection(function (err){
    if (err) throw err;
});

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());


passport.use(new BasicStrategy(



    /*connectio.getConnection(function (err, connection){
        callback(err, connection);
    }),*/

    async function (Username, Password, done) { 
      try {
      const customerUser = await customer.getCustomerByName(Username)
  
          
          if(customerUser == undefined) {
            // Username not found
            console.log("HTTP Basic username not found");
            return done(null, false, { message: "HTTP Basic username not found" });
          }
          console.log("nimitarkistus ohi");
          console.log(customerUser.Password)
          /* Verify password match */
          console.log(Password)
          if(bcrypt.compareSync(Password, customerUser.Password) == false) {
            // Password does not match
            console.log("HTTP Basic password not matching username");
            return done(null, false, { message: "HTTP Basic password not found" });
          }
          console.log("Läpi");
          console.log(customerUser);
          const finalCustomer = {customerId: customerUser.customerId, FUsername: customerUser.Username};
  
          return done(null, finalCustomer);
        
}
  
        catch(error) {
          console.log(error);
        }
      }));




app.post(
'/loginForJWT',
 passport.authenticate('basic', { session: false }),
 (req, res) => {
   console.log("In post");
   const body = {
    customerId : req.user.customerId,
    Username: req.user.Username
    };
    console.log(body);
     
     const payload = {
       customer : body
     };
      
    const options = {
      expiresIn: '1d'
    }
      
    /* Sign the token with payload, key and options.
        Detailed documentation of the signing here:
        https://github.com/auth0/node-jsonwebtoken#readme */
     const token = jwt.sign(payload, jwtSecretKey, options);
      
    return res.json({ token });
   })

   app.get('/customers', function (req, res) {
    // Connecting to the database.
    connectio.getConnection(function (err, connection) {

    // Executing the MySQL query (select all data from the 'customers' table).
    connectio.query('SELECT * FROM customer', function (error, results, fields) {
      // If some error occurs, we throw an error.
      if (error) throw error;
      console.log(error);
      // Getting the 'response' from the database and sending it to our route. This is were the data is.
      res.send(results)
    });
  });
});
    
app.post('/register',
      //customer registration
      //passport.authenticate('jwt', { session: false }),
      function (req, res) 
      {
        connectio.getConnection(function (err, connection) {
        //check field filling
        if(!req.body.Username || !req.body.Password || !req.body.Address || !req.body.ContactInfo)
        {
            //fields not filled, bad request
           res.sendStatus(400);
        }

        else
        {
            const salt = bcrypt.genSaltSync(6);
            const hashedPassword = bcrypt.hashSync(req.body.Password, salt);
            connectio.query('INSERT INTO customer(customerId,Username,Password,Token,Address,ContactInfo)VALUES(?,?,?,?,?,?);',[uuidv4(),req.body.Username, hashedPassword, req.body.Token, req.body.Address, req.body.ContactInfo]);
            res.sendStatus(201);
        }
      });
    });


    // Starting our server.
app.listen(8000, () => {
    console.log('Go to http://localhost:8000');
   });