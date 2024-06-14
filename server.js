require("dotenv").config(); //Allow to access of config file

const express = require("express");
const server = express();
const path = require("path");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 1000;
// console.log("PORT: ",PORT);

// flash 
const flash = require("connect-flash")

//Session
const session = require("express-session");
const mongodb_session = require("connect-mongodb-session")(session);


const AuthModel = require("./model/authModel")


// Routing
const route = require("./Router/routes");
const authRouter = require("./Router/authRouter");

// ejs file setup
server.set("view engine", "ejs");
server.set("views", "view");

// Middleware to parse URL-encoded data
server.use(express.urlencoded({ extended: true }));

// Static files are files that don't change, such as HTML files, CSS files, JavaScript files, images, etc.
server.use(express.static(path.join(__dirname, "Public")));
server.use(express.static(path.join(__dirname, "uploads")));

// Flash setup
server.use(flash());



//Session data setup
const session_store = new mongodb_session({
  uri: process.env.DB_URL,
  collection: "auth-session"
})

// Session functionality / session permission
server.use(session({
  secret: "Project-secret-key",
  resave: false,
  saveUninitialized: false,
  store: session_store
}))


server.use(async (req, res, next) => {
  if(!req.session.user){
    return next();
  }
  let userValue = await AuthModel.findById(req.session.user._id);
  // console.log("User value is: ", userValue)
  if(userValue){
    req.user = userValue;
    // console.log("User details: ", req.user);
    next();
  }
  else{
    console.log("User not");
  }
})










server.use(route);
server.use(authRouter);

// Mongoose Setup
mongoose
  .connect(process.env.DB_URL)
  .then((res) => {
    console.log("DB Connected successfully");
    server.listen(PORT, () => {
      console.log(`Server running at: http://localhost:${PORT}/home`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
