const mydb = require('./mydb')
const express = require('express');

//functions of User2 for users.js:
module.exports = {

  //function that is used for getting userinformation by name:
  getUserByName: async function(ContactInfo)
  {
    var results2;
    var ContactInfo2;
    
    var results = await mydb.query('SELECT * FROM managers;');
    
    results2= results.find(u => u.ContactInfo == ContactInfo)
    ContactInfo2 = results2.ContactInfo;

    if (ContactInfo2 == ContactInfo)
    {
      console.log("going back");
      console.log(results2);
      return results2;
    }
    else
    {
      return undefined;
    }
  },


  //function used to get users by username (uses the mighty callback method):
  getUserByUsername(ContactInfo, callback)
  {
    mydb.query('SELECT * FROM managers WHERE ContactInfo = ?', [ContactInfo], function(err, result)
    {
        if (err) 
            //sql command error
            callback(err, null);
        else
        {
          //return the first found username (it is the one we want because usernames are unique)
          callback(null, result[0]);
        }
    });
  },

  //function for adding a new user:
  /*addUser: (username, password, name, email, phoneNumber) => {
    db.query('INSERT INTO users (username,password,name,email,phoneNumber)VALUES (?,?,?,?,?);'
    ,[username,password,name,email,phoneNumber]);
    console.log("201,created");
  }*/
}