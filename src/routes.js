const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
 
const connectio = mysql.createPool({
  host     : 'yummygo.mysql.database.azure.com',
  user     : 'Darkstratocaster@yummygo',
  password : 'Yummygoadmin123',
  database : 'mydb',
  acquireTimeout: 600
});

const app = express();

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
    connectio.query('SELECT * FROM order', function (error, results, fields) {
      // If some error occurs, we throw an error.
      if (error) throw error;
      console.log(error);
      // Getting the 'response' from the database and sending it to our route. This is were the data is.
      res.send(results)
    });
  });
});

app.get('/orders/:customerId', function (req, res) {
    // Connecting to the database.
    connectio.getConnection(function (err, connection) {

    // Executing the MySQL query (select all data from the 'users' table).
    connectio.query('SELECT * FROM order WHERE customerId = ?',[req.params.customerId], function (error, results, fields) {
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