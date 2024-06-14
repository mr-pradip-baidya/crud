const express=require('express');
const router=express.Router();
const {
  home,
  postData,
  viewProducts,
  singleData,
  viewEditPage,
  editPage,
  deleteProduct,
 
} = require("../Controller/controller");

const multer = require('multer');
const path = require("path");

// Image Upload

// to use the images after adding it to database
const fileStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, path.join(__dirname, "..", "uploads"), (err, data) => {
      if(err) throw err;
    })
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname, (err, data) => {
      if(err) throw err;
    })
  } 
})

// file filtering
// file.mimetype === "image/jpg"

const fileFilter = (req, file, callback) => {
  if(
    file.mimetype.includes("png") ||
    file.mimetype.includes("jpg") ||
    file.mimetype.includes("jpeg") ||
    file.mimetype.includes("gif") ||
    file.mimetype.includes("webp")
  ){
    callback(null, true);
  } else{
    callback(null, false)
  }
}

// Multer setup
const upload = multer({
  storage: fileStorage,
  fileFilter: fileFilter,
  limits: {fileSize: 1024 * 1024 * 5}
})


// Path setup
router.get("/home",home);
// router.post("/postData", upload.single("product_image"), postData); //Single
router.post("/postData", upload.array("product_image", 2), postData); //Multiple or  files

// View Product
router.get("/viewProducts", viewProducts);
router.get("/singleValue/:id",singleData);

// Edit
router.get("/editProduct/:id", viewEditPage);
router.post("/newProduct",upload.array("p_image", 2), editPage);

// Delete
router.get("/deleteProduct/:id", deleteProduct)










module.exports=router;