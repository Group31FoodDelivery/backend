const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const { v4: uuidv4 } = require('uuid');
 
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
        if(!req.body.Username || !req.body.Password || !req.body.Token || !req.body.Address || !req.body.ContactInfo)
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
            connectio.query('INSERT INTO customer(customerId,Username,Password,Token,Address,ContactInfo)VALUES(?,?,?,?,?,?);',[uuidv4(),req.body.Username, req.body.Password, req.body.Token, req.body.Address, req.body.ContactInfo]);
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


    app.post('/registerManager',
    //only authenticated users can create bands
    //passport.authenticate('jwt', { session: false }),
    function (req, res) 
    {
      connectio.getConnection(function (err, connection) {
      //check field filling
      if(!req.body.Firstname || !req.body.Surname || !req.body.Password || !req.body.Token || !req.body.Address || !req.body.ContactInfo)
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
          connectio.query('INSERT INTO manager(managerId,Firstname,Surname,Address,ContactInfo,Token,Password)VALUES(?,?,?,?,?,?,?);',[uuidv4(),req.body.Firstname, req.body.Surname, req.body.Address, req.body.ContactInfo, req.body.Token, req.body.Password]);
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

        /*/if(!req.body.Received || !req.body.Preparing || !req.body.Ready_For_Delivery || !req.body.Delivering || !req.body.Delivered || !req.body.Time)
        {
           res.sendStatus(400);
        }
        else*/
        {
            connectio.query('INSERT INTO orders(orderId,Received,Preparing,Ready_For_Delivery,Delivering,Delivered,Time,customerId)VALUES(?,?,?,?,?,?,?,?);',[uuidv4(),req.body.Received, req.body.Preparing, req.body.Ready_For_Delivery, req.body.Delivering, req.body.Delivered, req.body.Time, req.body.customerId]);
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