const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const AuthModel = require("../model/authModel");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const TokenModel = require("../model/tokenModel");

// const { log } = require("console");

// ***********Email setup**************
const transporter = nodemailer.createTransport({
  host: "smtp",
  port: 465,
  secure: false,
  requireTLS: true,
  service: "gmail",
  auth: {
    user: "biltubaidya8888@gmail.com",
    pass: "ycfe jxzh sfnp robl"
  }
})



// Authentication sign up page rendering
const authSignUp = (req, res) => {
  // flash messege
  let err_msg = req.flash("error");
  console.log("Error messege:", err_msg);
  

  res.render("auth/authSignUp", { 
    title: "Authentication SignUp" ,
    // errMsg: errMsg,
  });
};

// *********Post data from body**********
const postData = async (req, res) => {
  try {
    const { email, password } = req.body;
    // console.log("Email: ", email);

    const user = await AuthModel.findOne({ email: email });

    if (user) {
      console.log("User exits: ");
      res.render("auth/authSignUp", {
        title: "Authentication SignUp",
      });
    } else {
      if (req.body.password === req.body.confirm_password) {
        let hashPassword = await bcrypt.hash(req.body.password, 12);
        // console.log("hashPassword : ", hashPassword);

        let authData = new AuthModel({
          full_name: req.body.full_name.toLowerCase(),
          email: req.body.email.toLowerCase(),
          password: hashPassword,
          gender: req.body.gender,
          user_image: req.files.user_image[0].filename,
          identity_proof: req.files.identity_proof[0].filename,
        });

        // console.log("AuthData: ", authData);

        let saveUser = await authData.save();
        // console.log("Save user: ", saveUser);

        if (saveUser) {
          console.log("User Registation data send to database");

          const token_jwt = jwt.sign(
            { email: req.body.email },
            "Secreckey123456789@Secreckey123456789",
            {expiresIn: "1h"}
          );

          const token_data = new tokenModel({
            token: token_jwt,
            _userId: saveUser._id,
          })

          let tokenSaved = await token_data.save();

          if(tokenSaved){
            let mailOptions = {
              from: "biltubaidya8888@gmail.com",
              to: req.body.email,
              subject: "Email verification",
              text:
                "Hello" +
                req.body.full_name +
                "\n\nYou have successfully submitted your data to be registered. Please verify your account by clicking the link: \n" +
                "http://" +
                req.headers.host +
                "/mail_confirmation/" +
                req.body.email +'/'+token_jwt+
                "\n\nThank You!\n\n",
            };
          

          // Transporter setup
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log("Error to send mail:", error);
              res.redirect("/authSignUp");
            } else {
              console.log("Email sent:", info.response);
              // res.redirect("/auth/signIn");
            }
          });
        }
          // res.redirect("/auth/signIn"); //Go Router
        } else {
          console.log("User Not Registered");
        }
      }else{
        req.flash("error", "Password mismatch");
        console.log("Password mismatch");
      }
    }
  } catch (error) {
    console.log("Error at collecting product: ", error);
  }
};

// ****************Verify User*************************
const mail_confirmation = async(req, res) => {
  try{
    console.log("Received mail from confirmation mail", req.params.email, req.params.token);
    let validToken=await TokenModel.findOne({token: req.params.token});
    console.log(validToken);
    if(validToken)
      {
    let user_data = await AuthModel.findOne({email: req.params.email})
    console.log("Data of user whose mail verification is conducting", user_data);

    if(user_data.isVerified){
      console.log("User already verified.");
      req.flash("msg", "User already verified, go to login")
      res.redirect("/authSignUp");
    }
    else{
      user_data.isVerified = true;
      let save_res = await user_data.save();
      console.log("Saved new user data:", save_res);

      if(save_res){
        console.log("Your account successfully verified");
        res.redirect("/verified")
        res.redirect("/auth/signIn");
        
      }
    }
      }
      else{
        console.log("Link expired");
      }
  }
  catch(err){
    console.log("mail_confirmation:", err);
  }
}

// ***************Verified page rendering******************
const verified = (req, res) => {
  res.render("auth/verified",{
    title: "Verified Page"
  })
}

// Signin Page Render
const authSignIn = (req, res) => {
  let errMsg = req.flash("error");
  console.log("Error messege: ", errMsg);

  // if (errMsg.length > 0) {
  //   errMsg = errMsg[0];
  // }
  // else{
  //   errMsg = null;
  // }

  res.render("auth/sign-in", {
    title: "Auth Sign In",
    errMsg: errMsg,
  });
};

// Post Data from Auth sign in body
const postAuthLogin = async (req, res) => {
  try {
    let email = req.body.email;
    let password = req.body.password;
    let user_exist = await AuthModel.findOne({ email: email });
    // console.log("User Exist: ", user_exist);
    if (user_exist) {
      let user_password = await bcrypt.compare(password, user_exist.password);

      if (user_password) {
        console.log("Password Matched");
        // res.redirect("/viewProducts");
        req.session.isLoggedIn = true;
        req.session.user = user_exist;

        await req.session.save((err) => {
          if (err) {
            console.log("Session saving error: ", err);
          } else {
            console.log("Login successfull");
            return res.redirect("/viewProducts");
          }
        });
      } else {
        console.log("Password Not Matched");
        req.flash("error", "Wrong Password!");
        res.redirect("/auth/signIn");
      }
    } else {
      req.flash("error", "Invalid email!");
      res.redirect("/auth/signIn");
    }
  } catch (err) {
    console.log("Auth Login: ", err);
  }
};

const myAccount = async (req, res) => {
  try {
    let user_id = req.user._id;
    // console.log("User id : ", user_id);

    let user = await AuthModel.findById(user_id);
    console.log("User: ", user);

    res.render("auth/account", {
      title: "My Account",
      user: user,
    });
  } catch (err) {
    console.log();
  }
};

// Session Logout or session Destroy
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log("Session Destroy Error: ", err);
    } else {
      console.log("Session Destroyed/ Logout");
      res.redirect("/auth/signIn");
    }
  });
};

module.exports = {
  authSignUp,
  postData,
  authSignIn,
  postAuthLogin,
  myAccount,
  logout,
  mail_confirmation,
  verified,
};
