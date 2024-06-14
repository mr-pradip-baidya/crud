const express = require("express");
const router = express.Router();
const {
  authSignUp,
  postData,
  authSignIn,
  postAuthLogin,
  myAccount,
  logout,
  mail_confirmation,
  verified,
} = require("../Controller/authController");

const multer = require("multer");
const path = require("path");

// Image Upload 

// to use the images after adding it to database
const fileStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, path.join(__dirname, "..", "uploads","auth"), (err, data) => {
      if (err) throw err;
    });
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname, (err, data) => {
      if (err) throw err;
    }); 
  },
});

// file filtering
// file.mimetype === "image/jpg"

const fileFilter = (req, file, callback) => {
  if (
    file.mimetype.includes("png") ||
    file.mimetype.includes("jpg") ||
    file.mimetype.includes("jpeg") ||
    file.mimetype.includes("gif") ||
    file.mimetype.includes("webp")
  ) {
    callback(null, true);
  } else {
    callback(null, false);
  }
};

// Multer setup
const upload = multer({
  storage: fileStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 },
});


const upload_type = upload.fields([
  { name: "user_image", maxCount: 1 },
  { name: "identity_proof", maxCount: 1 },
]);

// Path setup
router.get("/authSignUp", authSignUp);

router.get("/auth/signIn", authSignIn); //login page rendering
router.post("/auth/login", postAuthLogin); //login page data post
router.get("/myAccount", myAccount) //Account page

router.get("/logout", logout)
router.get("/mail_confirmation/:email/:token", mail_confirmation);
router.get("/verified", verified)

router.post(
  "/postAuthData",
  upload_type,
  postData
); //Multiple or  files
 

module.exports = router;
