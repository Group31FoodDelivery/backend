const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const { v4: uuidv4 } = require('uuid');
const passport = require('passport');
const managers = require('./modules/users');
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

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//let ContactInfo, Password;

passport.use(new BasicStrategy(
  //let manager ={};
  //console.log(manager);
    /*connectio.getConnection(function (err, connection) {

      // Executing the MySQL query (select all data from the 'users' table).
      connectio.query('SELECT * FROM manager', function (error, results, fields) {
        // If some error occurs, we throw an error.
        if (error) throw error;
        console.log(error);
        // Getting the 'response' from the database and sending it to our route. This is were the data is.
      ContactInfo = results.ContactInfo;
      Password = results.Password;
      });
    }),*/
       
  function (ContactInfo, Password, done) {
    const manager = managers.getUserByName(ContactInfo);
    //console.log(manager.ContactInfo);
    if(manager == undefined) {
      // Username not found
      console.log("HTTP Basic username not found");
      return done(null, false, { message: "HTTP Basic username not found" });
    }

    /* Verify password match */
    if(bcrypt.compareSync(Password, manager.Password) == false) {
      // Password does not match
      console.log("HTTP Basic password not matching username");
      return done(null, false, { message: "HTTP Basic password not found" });
    }
    return done(null, manager);
  }
  ));

const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy,
      ExtractJwt = require('passport-jwt').ExtractJwt;
let jwtSecretKey = null;
if(process.env.JWTKEY === undefined) {
  jwtSecretKey = require('./jwt-key.json').secret;
} else {
  jwtSecretKey = process.env.JWTKEY;
}


let options = {}

/* Configure the passport-jwt module to expect JWT
   in headers from Authorization field as Bearer token */
options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();

/* This is the secret signing key.
   You should NEVER store it in code  */
options.secretOrKey = jwtSecretKey;

passport.use(new JwtStrategy(options, function(jwt_payload, done) {
  console.log("Processing JWT payload for token content:");
  console.log(jwt_payload);


  const now = Date.now() / 1000;
  if(jwt_payload.exp > now) {
    done(null, jwt_payload.user);
  }
  else {// expired
    done(null, false);
  }
}));


app.get(
  '/jwtProtectedResource',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    console.log("jwt");
    res.json(
      {
        status: "Successfully accessed protected resource with JWT",
        user: req.user
      }
    );
  }
);

/*app.post('/loginForJWT', passport.authenticate('basic', {
  session: false
}), (req, res) => {
  console.log("Hello");

  res.send('ok');
});*/

app.post(
  '/loginForJWT',
  passport.authenticate('basic', { session: false }),
  (req, res) => {
    console.log("In post");
    const body = {
      managerId : req.user.managerId,
      Firstname: req.user.Firstname
    };
    console.log(body);

    const payload = {
      manager : body
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

// Creating a GET route that returns data from the 'users' table.
app.get('/customers', function (req, res) {
    // Connecting to the database.
    connectio.getConnection(function (err, connection) {

    // Executing the MySQL query (select all data from the 'users' table).
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
      //only authenticated users can create bands
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

        /*if('Username' in req.body == false ) {
          res.sendStatus(400);
        }*/

        else
        {
            const salt = bcrypt.genSaltSync(6);
            const hashedPassword = bcrypt.hashSync(req.body.Password, salt);
            connectio.query('INSERT INTO customer(customerId,Username,Password,Token,Address,ContactInfo)VALUES(?,?,?,?,?,?);',[uuidv4(),req.body.Username, hashedPassword, req.body.Token, req.body.Address, req.body.ContactInfo]);
            res.sendStatus(201);
        }
      });
    });


app.get('/managers', function (req, res) {
    // Connecting to the database.
    connectio.getConnection(function (err, connection) {

    // Executing the MySQL query (select all data from the 'users' table).
    connectio.query('SELECT * FROM manager', function (error, results, fields) {
      // If some error occurs, we throw an error.
      if (error) throw error;
      console.log(error);
      // Getting the 'response' from the database and sending it to our route. This is were the data is.
      res.send(results)
    });
  });
});


app.post('/restaurants',
      //only authenticated users can create bands
      //passport.authenticate('jwt', { session: false }),
      function (req, res) 
      {
        connectio.getConnection(function (err, connection) {
        //check field filling
        if(!req.body.Name  || !req.body.Type || !req.body.OperatingHours || !req.body.Price_level || !req.body.Rating || !req.body.Address || !req.body.Description)
        {
            //fields not filled, bad request
           res.sendStatus(400);
        }

        /*if('Username' in req.body == false ) {
          res.sendStatus(400);
        }*/

        else
        {
            //create band if all fields are filled
            connectio.query('INSERT INTO restaurant(restaurantId,Name,Address,OperatingHours,Price_level,Type,Rating,Description,managerId)VALUES(?,?,?,?,?,?,?,?,?);',[uuidv4(), req.body.Name, req.body.Address, req.body.OperatingHours, req.body.Price_level, req.body.Type, req.body.Rating, req.body.Description, req.body.managerId]);
            res.sendStatus(201);
        }
      });
    });


app.post('/restaurants/images',upload.single('kuva') , function (req, res, next){


console.log(req.file);
console.log(req.file.filename);
res.sendStatus(200);


});



    app.post('/registerManager',
    //only authenticated users can create bands
    //passport.authenticate('jwt', { session: false }),
    function (req, res) 
    {
      connectio.getConnection(function (err, connection) {
      //check field filling
      if(!req.body.Firstname || !req.body.Surname || !req.body.Password || !req.body.Address || !req.body.ContactInfo)
      {
          //fields not filled, bad request
         res.sendStatus(400);
      }

      /*if('Username' in req.body == false ) {
        res.sendStatus(400);
      }*/

      else
      {
          const salt = bcrypt.genSaltSync(6);
          const hashedPassword = bcrypt.hashSync(req.body.Password, salt);
          //create band if all fields are filled
          connectio.query('INSERT INTO manager(managerId,Firstname,Surname,Address,ContactInfo,Token,Password)VALUES(?,?,?,?,?,?,?);',[uuidv4(),req.body.Firstname, req.body.Surname, req.body.Address, req.body.ContactInfo, req.body.Token, hashedPassword]);
          res.sendStatus(201);
      }
    });
  });

app.get('/restaurants', function (req, res) {
    // Connecting to the database.
    connectio.getConnection(function (err, connection) {

    // Executing the MySQL query (select all data from the 'users' table).
    connectio.query('SELECT * FROM restaurant', function (error, results, fields) {
      // If some error occurs, we throw an error.
      if (error) throw error;
      console.log(error);
      // Getting the 'response' from the database and sending it to our route. This is were the data is.
      res.send(results)
    });
  });
});


app.get('/menuitems', function (req, res) {
    // Connecting to the database.
    connectio.getConnection(function (err, connection) {

    // Executing the MySQL query (select all data from the 'users' table).
    connectio.query('SELECT * FROM menuitem', function (error, results, fields) {
      // If some error occurs, we throw an error.
      if (error) throw error;
      console.log(error);
      // Getting the 'response' from the database and sending it to our route. This is were the data is.
      res.send(results)
    });
  });
});


app.get('/orders', function (req, res) {
    // Connecting to the database.
    connectio.getConnection(function (err, connection) {

    // Executing the MySQL query (select all data from the 'users' table).
    connectio.query('SELECT * FROM orders', function (error, results, fields) {
      // If some error occurs, we throw an error.
      if (error) throw error;
      console.log(error);
      // Getting the 'response' from the database and sending it to our route. This is were the data is.
      res.send(results)
    });
  });
});


app.post('/Addorders',
      
      function (req, res) 
      {
        connectio.getConnection(function (err, connection) {

        if(!req.body.Time)
        {
           res.sendStatus(400);
        }
        else
        {
            connectio.query('INSERT INTO orders(orderId,Received,Preparing,Ready_For_Delivery,Delivering,Delivered,Time,customerId)VALUES(?,?,?,?,?,?,?,?);',[uuidv4(),false, false, false, false, false, req.body.Time, req.body.customerId]);
            res.sendStatus(201);
        }
      });
    });


    app.post('/addMenuItem',
    //only authenticated users can create bands
    //passport.authenticate('jwt', { session: false }),
    function (req, res) 
    {
      connectio.getConnection(function (err, connection) {
      //check field filling
      if(!req.body.Name || !req.body.Description || !req.body.Price || !req.body.Category)
      {
          //fields not filled, bad request
         res.sendStatus(400);
      }

      else
      {
          //create band if all fields are filled
          connectio.query('INSERT INTO menuitem(itemId,Name,Description,Price,Image,Category,restaurantId)VALUES(?,?,?,?,?,?,?);',[uuidv4(),req.body.Name, req.body.Description, req.body.Price, req.body.Image, req.body.Category, req.body.restaurantId]);
          res.sendStatus(201);
      }
    });
  });


app.get('/orders/:customerId', function (req, res) {
    // Connecting to the database.
    connectio.getConnection(function (err, connection) {

    // Executing the MySQL query (select all data from the 'users' table).
    connectio.query('SELECT * FROM orders WHERE customerId = ?',[req.params.customerId], function (error, results, fields) {
      // If some error occurs, we throw an error.
      if (error) throw error;
      console.log(error);
      // Getting the 'response' from the database and sending it to our route. This is were the data is.
      res.send(results)
    });
  });
});


app.get('/restaurants/menuitem/:restaurantId', function (req, res) {
    // Connecting to the database.
    connectio.getConnection(function (err, connection) {

    // Executing the MySQL query (select all data from the 'users' table).
    connectio.query('SELECT * FROM menuitem WHERE restaurantId = ?',[req.params.restaurantId], function (error, results, fields) {
      // If some error occurs, we throw an error.
      if (error) throw error;
      console.log(error);
      // Getting the 'response' from the database and sending it to our route. This is were the data is.
      res.send(results)
    });
  });
});

// Starting our server.
app.listen(9000, () => {
 console.log('Go to http://localhost:9000/restaurants so you can see the data.');
});