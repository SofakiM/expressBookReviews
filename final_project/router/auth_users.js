//contains the skeletal implementations for the routes which an authorized user can access.

const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
};

const authenticatedUser = (username,password)=>{ //returns boolean
let validusers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  if(validusers.length > 0){
    return true;
  } else {
    return false;
  }
};

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }

  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken,username
  }
  return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    let filtered_users = users.filter((user) => user.isbn === isbn);
    if (filtered_users.length > 0) {
        let filtered_user = filtered_users[0];
        let author = req.query.author;
        let title = req.query.title;
        let review = req.query.review;

        //if the DOB has changed
        if(review) {
            filtered_user.review = review
        }
       
        users = users.filter((user) => user.isbn != isbn);
        users.push(filtered_user);
        res.send(`Book with the isbn  ${isbn} updated.`);
    }
    else{
        res.send("Unable to find book!");
    }
  });
  
  // Delete a book review
  regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.params.review;
    users = users.filter((user) => user.review != review);
    res.send(`User with the review  ${isbn} deleted.`);
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
