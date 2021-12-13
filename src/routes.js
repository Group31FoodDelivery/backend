const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const { v4: uuidv4 } = require('uuid');
const passport = require('passport');
const manager = require('./modules/users');
const bcrypt = require('bcryptjs');
const customer = require('./modules/users');
const cors = require('cors');
const path = require('path');

const BasicStrategy = require('passport-http').BasicStrategy;

const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/")
  },
  filename: function (req, file, cb){
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({ storage: storage})
 
const connectio = mysql.createPool({
  host     : 'eu-cdbr-west-01.cleardb.com',
  user     : 'b80d1992047d2c',
  password : 'b9e1504d',
  database : 'heroku_f5283267ccef653',
  acquireTimeout: 600
});

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());

//let ContactInfo, Password;

passport.use(new BasicStrategy(

  
  async function (ContactInfo, Password, done) { try {
    console.log("ContactInfo: " + ContactInfo);
    console.log("Password: " + Password);
    const managerUser = await manager.getUserByName(ContactInfo) 


        if(managerUser == undefined) {
          // Username not found
          console.log("HTTP Basic username not found");
          return done(null, false, { message: "HTTP Basic username not found" });
        }
        console.log("nimitarkistus ohi");
        /* Verify password match */
        console.log(Password);
        if(bcrypt.compareSync(Password, managerUser.Password) == false) {
          // Password does not match
          console.log("HTTP Basic password not matching username");
          return done(null, false, { message: "HTTP Basic password not found" });
        }
        console.log("Läpi");
        console.log(managerUser);
        const finalManager = {managerId: managerUser.managerId, Firstname: managerUser.Firstname};

        return done(null, finalManager);
      }

      catch(error) {
        console.log(error);
      }
    }));


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
    done(null, jwt_payload.manager);
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

  /*app.post(
    '/loginForJWTCustomer',
    passport.authenticate('basic', { session: false }),
    (req, res) => {
      console.log("In post");
      const body = {
        customerId : req.user.customerId,
        Username: req.user.Username
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
     /* const token = jwt.sign(payload, jwtSecretKey, options);
  
      return res.json({ token });
    })*/

// Creating a GET route that returns data from the 'customers' table.
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

/*app.post('/register',
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
    });*/


app.get('/managers', function (req, res) {
    // Connecting to the database.
    connectio.getConnection(function (err, connection) {

    // Executing the MySQL query (select all data from the 'manager' table).
    connectio.query('SELECT * FROM manager', function (error, results, fields) {
      // If some error occurs, we throw an error.
      if (error) throw error;
      console.log(error);
      // Getting the 'response' from the database and sending it to our route. This is were the data is.
      res.send(results)
    });
  });
});




app.put('/restaurants/images/:restaurantId',upload.single('kuva') , function (req, res, err){


connectio.query('UPDATE restaurant SET Image = ? WHERE restaurantId = ?;',[req.file.filename, req.params.restaurantId], (err, result) =>{
    if(err) {
      console.log(err)
      res.send(err)
    }
    if (result) {
      console.log(req.file);
      console.log(req.file.filename);
      res.sendStatus(200);
    }
  });
});

app.put("/orders/:orderId", function(req, res) {
  
  connectio.query('UPDATE orders SET State = ?, Time = ? WHERE orderId = ?;',[req.body.state, req.body.time, req.params.orderId],
  (err, result) =>{
    if(err) {
      console.log(err)
      res.send(err)
    }
    if (result) {
      console.log(result);
      console.log(req.body);
      res.sendStatus(200);
    }
})});


app.get("/restaurants/images/:restaurantId", function (req, res) {
connectio.query('SELECT Image FROM restaurant WHERE restaurantId = ?;', [req.params.restaurantId], function (error, results) {

      if (error){ 
        console.log(error);
      }
      if (results){
        console.log("resultseissa");
        console.log(results[0].Image);
      res.sendFile(path.join(__dirname, "./uploads/"+results[0].Image));
    
    }

    })
});


    app.post('/registerManager',
    //manager registration
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
          //manager is registered if all fields are filled
          connectio.query('INSERT INTO manager(managerId,Firstname,Surname,Address,ContactInfo,Token,Password)VALUES(?,?,?,?,?,?,?);',[uuidv4(),req.body.Firstname, req.body.Surname, req.body.Address, req.body.ContactInfo, req.body.Token, hashedPassword]);
          res.sendStatus(201);
      }
    });
  });

app.get('/restaurants', function (req, res) {
    // Connecting to the database.
    connectio.getConnection(function (err, connection) {

    // Executing the MySQL query (select all data from the 'restaurant' table).
    connectio.query('SELECT * FROM restaurant', function (error, results, fields) {
      // If some error occurs, we throw an error.
      if (error) throw error;
      console.log(error);
      // Getting the 'response' from the database and sending it to our route. This is were the data is.
      res.send(results)
    });
  });
});

app.get('/restaurants/:managerId', function (req, res) {
  // Connecting to the database.
  connectio.getConnection(function (err, connection) {

  // Executing the MySQL query (select all data from the 'restaurant' table).
  connectio.query('SELECT * FROM restaurant WHERE managerId = ?',[req.params.managerId], function (error, results, fields) {
    // If some error occurs, we throw an error.
    if (error) throw error;
    console.log(error);
    // Getting the 'response' from the database and sending it to our route. This is were the data is.
    res.send(results)
  });
});
});

app.get('/orders/:managerId', function (req, res) {
  // Connecting to the database.
  connectio.getConnection(function (err, connection) {

  // Executing the MySQL query (select all data from the 'restaurant' table).
  connectio.query('SELECT *, customer.ContactInfo from customer JOIN orders on customer.customerId = orders.customerId JOIN menuitem_order on orders.orderId = menuitem_order.orderId JOIN menuitem on menuitem_order.itemId = menuitem.itemId JOIN restaurant on menuItem.restaurantId = restaurant.restaurantId join manager on restaurant.managerId = manager.managerId where manager.managerId = ?',[req.params.managerId], function (error, results, fields) {
    // If some error occurs, we throw an error.
    if (error) throw error;
    console.log(error);
    // Getting the 'response' from the database and sending it to our route. This is were the data is.
    res.send(results);
  });
});
});

app.post('/restaurants',
      //only managers can create restaurants
      passport.authenticate('jwt', { session: false }),
      function (req, res) 
      {
        connectio.getConnection(function (err, connection) {
        //check field filling
        if(!req.body.Name  || !req.body.Type || !req.body.OperatingHours || !req.body.Price_level || !req.body.Rating || !req.body.Address || !req.body.Description || req.body.Image)
        {
            //fields not filled, bad request
           res.sendStatus(400);
        }

        else
        {
            console.log(req.user.managerId)
            connectio.query('INSERT INTO restaurant (restaurantId,Name,Address,OperatingHours,Price_level,Type,Rating,Description,Image,managerId)VALUES(?,?,?,?,?,?,?,?,?,?);',[uuidv4(), req.body.Name, req.body.Address, req.body.OperatingHours, req.body.Price_level, req.body.Type, req.body.Rating, req.body.Description, req.body.Image, req.user.managerId]);
            console.log(res.statusCode);
            res.sendStatus(201);
        }
      });
    });


app.get('/menuitems', function (req, res) {
    // Connecting to the database.
    connectio.getConnection(function (err, connection) {

    // Executing the MySQL query (select all data from the 'menuitem' table).
    connectio.query('SELECT * FROM menuitem', function (error, results, fields) {
      // If some error occurs, we throw an error.
      if (error) throw error;
      console.log(error);
      // Getting the 'response' from the database and sending it to our route. This is were the data is.
      res.send(results)
    });
  });
});


app.put('/menuitems/images/:itemId',upload.single('kuva') , function (req, res, err){


  connectio.query('UPDATE menuitem SET Image = ? WHERE itemId = ?;',[req.file.filename, req.params.itemId], (err, result) =>{
      if(err) {
        console.log(err)
        res.send(err)
      }
      if (result) {
        console.log(req.file);
        console.log(req.file.filename);
        res.sendStatus(200);
      }
  });
});


app.get("/menuitems/images/:itemId", function (req, res) {
  connectio.query('SELECT Image FROM menuitem WHERE itemId = ?;', [req.params.itemId], function (error, results) {
    
        if (error){ 
          console.log(error);
        }
        if (results){
          console.log("pitsaa haetaan");
          
          console.log(results[0].Image);
         res.sendFile(path.join(__dirname, "./uploads/"+results[0].Image));
      
       }
    
       })
  });


app.get('/orders', function (req, res) {
    // Connecting to the database.
    connectio.getConnection(function (err, connection) {

    // Executing the MySQL query (select all data from the 'orders' table).
    connectio.query('SELECT * FROM orders', function (error, results, fields) {
      // If some error occurs, we throw an error.
      if (error) throw error;
      console.log(error);
      // Getting the 'response' from the database and sending it to our route. This is were the data is.
      res.send(results)
    });
  });
});

app.get('/menuorders', function (req, res) {
  // Connecting to the database.
  connectio.getConnection(function (err, connection) {

  // Executing the MySQL query (select all data from the 'orders' table).
  connectio.query('SELECT * FROM menuitem_order', function (error, results, fields) {
    // If some error occurs, we throw an error.
    if (error) throw error;
    console.log(error);
    // Getting the 'response' from the database and sending it to our route. This is were the data is.
    res.send(results)
  });
});
});


    app.post("/Addorders", (req, res) => {
      
      let orderId =  uuidv4();
      let sql = 'INSERT INTO orders(orderId,Time,customerId,address,TotalPrice,State,TimeStamp)VALUES(?,?,?,?,?,?,?)';
     // let sql2 = 'INSERT INTO menuitem_order(itemId, orderId, amount)VALUES(?,?,?)';
      
     passport.authenticate('jwt', { session: false })
      connectio.query(
        sql,
        [
          orderId,
          req.body.time,
          req.body.customerId,
          req.body.address,
          req.body.price,
          req.body.state,
          req.body.timestamp
        ],
        (err, result) => {
          if(err) {

            res.sendStatus(400);
    
          } else {
             
              console.log(result)
              res.json({orderId: orderId})
              
          }
        }
      );

    });

    app.post("/AddOrderItems", (req, res) => {
      
      let sql = 'INSERT INTO menuitem_order(itemId,orderId,Qty)VALUES(?,?,?)';
      
      connectio.query(
        sql,
        [
          req.body.itemId,
          req.body.orderId,
          req.body.amount
        ],
        (err, result) => {
          if(err || !req.body.itemId || !req.body.orderId || !req.body.amount) {

            res.sendStatus(400);
            console.log(err)
    
          } else {
             
              console.log(result)
              res.sendStatus(201)
              
          }
        }
      );
    });


    app.post('/addMenuItem/:restaurantId',
    //only managers can create menuitems
    passport.authenticate('jwt', { session: false }),
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
          connectio.query('INSERT INTO menuitem(itemId,ItemName,Description,Price,Image,Category,amount,restaurantId)VALUES(?,?,?,?,?,?,?,?);',[uuidv4(),req.body.Name, req.body.Description, req.body.Price, req.body.Image, req.body.Category, 0, req.params.restaurantId]);
          res.sendStatus(201);
      }
    });
  });


app.get('/orders/:customerId', function (req, res) {
    // Connecting to the database.
    connectio.getConnection(function (err, connection) {

    // Executing a MySQL query to find specific customers orders
    connectio.query('SELECT * FROM orders WHERE customerId = ?',[req.params.customerId], function (error, results, fields) {
      // If some error occurs, we throw an error.
      if (error) throw error;
      console.log(error);
      // Getting the 'response' from the database and sending it to our route. This is were the data is.
      res.send(results)
    });
  });
});

app.get('/orders/orderhistory/:customerId', function (req, res) {
  // Connecting to the database.
  connectio.getConnection(function (err, connection) {

  // Executing a MySQL query to find specific customers orders
  connectio.query('SELECT * from orders JOIN menuitem_order on orders.orderId = menuitem_order.orderId JOIN menuitem on menuitem_order.itemId = menuitem.itemId JOIN restaurant on menuItem.restaurantId = restaurant.restaurantId where customerId = ? ORDER BY TimeStamp DESC',[req.params.customerId], function (error, results, fields) {
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

    // Executing the MySQL query to find all menuitems of a specific restaurant.
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