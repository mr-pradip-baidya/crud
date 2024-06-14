const ProductModel = require("../model/product");
const fs = require("fs");
const path = require("path")

// Rendering home page
const home = (req, res) => {
  res.render("viewer/home", {
    title: "Home page",
  });
};

// Post data from body
const postData = async (req, res) => {
  try {

        console.log(req.files);
        
        // getting image from body
      let arr  = req.files.map((value) => {
            return value.originalname;
            
      })
      console.log(arr)

    let movies = await new ProductModel({
      product_name: req.body.product_name,
      product_price: req.body.product_price,
      product_company: req.body.product_company,
      product_image: arr ? arr : null,
    });

    let save = await movies.save(); //saved all data in database which name Product_Data & collection name is product_details
    // console.log(save);
    res.redirect("/viewProducts");
  } catch (error) {
    console.log("Error at collecting product: ", error);
  }
};

// View all movie name(Fetch data)
const viewProducts=async(req,res)=>{
      try {
            let products=await ProductModel.find();
            // console.log("Get movie data from database",movies);

            if(products){
                  res.render("viewer/viewProducts", {
                    title: "View all product",
                    data: products,
                  });
            }
      } catch (err) {
            console.log("Data not fetched",err);
      }
}

//Displayed the Single value details 
const singleData=async(req,res)=>{
      try{
            const params_id=req.params.id;
            // console.log("Single data is fetched: ",movie_id);
            const movie_id=await ProductModel.findById(params_id);
            if(movie_id){
                  res.render("viewer/details",{
                        title:"Details Page",
                        data: movie_id,
                  })
            }else{
                  console.log("Movie not found");
            }
      }
      catch(err){
            console.log("Single data is not fetched",err);
      }
}


//Edit
// 1st step => View the edit Page and displayed the oldest value
const viewEditPage = async(req, res) => {
      try{
            let product_id = req.params.id;
            // console.log("Product id: ", product_id)
            let old = await ProductModel.findById(product_id);
            // console.log("Collecting old product by Id: ", old);
            if(old){
                  res.render("viewer/editProduct", {
                        title: "Edit Page",
                        data: old,
                  })
            }
      }
      catch(err){
            console.log("Edit page not found", err);
      }
}

// Edit:
// 2nd step => Edit the data and submit 

const editPage = async(req, res) => {
      try{
            // Image original name
            let arr = req.files.map((value) => {
            return value.originalname;
            });
            // console.log("Edit page array: ",arr);

            // console.log("id: ", req.body.p_id);
            let ProductData = await ProductModel.findById(req.body.p_id);
            // console.log("ProductData: ", ProductData);

            ProductData.product_name = req.body.p_name;
            ProductData.product_price = req.body.p_price;
            ProductData.product_company = req.body.p_company;
            ProductData.product_image = arr;

            const saved = await ProductData.save();
            // console.log("Product is saved: ", saved);
            if(saved){
                  res.redirect(`/singleValue/${req.body.p_id}`);
            }
      }
      catch(err){
            console.log("Edit page not found", err);
      }
}


//Delete Product

const deleteProduct = async(req,res) => {
      try{
            let product_id = req.params.id;
            // console.log("Id of the product to be deleted: ", product_id);
            let deleted = await ProductModel.findOneAndDelete({_id: product_id});
            // console.log("Deleted: ", deleted);
            if(deleted){
                  deleted.product_image.forEach((file) => {
                        fs.unlinkSync(path.join(__dirname, "..", "uploads", file));
                  })
                  res.redirect("/viewProducts");
            }
      }
      catch(err){
            console.log("Not Deleted the value", err);
      }
}


module.exports = {
  home,
  postData,
  viewProducts,
  singleData,
  viewEditPage,
  editPage,
  deleteProduct,
};
