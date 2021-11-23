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


  const api = {
    query: (query, ...parameters) =>
    {
      let promise = new Promise(function(resolve, reject) {
        connectio.query(query, ...parameters, (error, results, fields) => {
          if(error) {
            reject(error)
          };
  
          resolve(results);
        })
      });
  
      return promise;
    },
    closeAll: () => {
      connectio.end();
    }
  };
  
  module.exports = api;