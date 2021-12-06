const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const { v4: uuidv4 } = require('uuid');
let connectio = null;

try {
 connectio = mysql.createPool({
  host     : 'eu-cdbr-west-01.cleardb.com',
  user     : 'b80d1992047d2c',
  password : 'b9e1504d',
  database : 'heroku_f5283267ccef653'
  });
}
catch {
  console.log("Pool creation failed");
}


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