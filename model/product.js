const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    product_name: {
      type: String,
      required: true,
    },
    product_price: {
      type: Number,
      required: true,
    },
    product_company: {
      type: String,
      require: true,
    },
    product_image: {
      // type:String, //single
      type: [String],
      default: ["https://placehold.co/600x400"],
      required: false,
    },
  },
  {
    timestamps: true,
    versionkey: false,
  }
);

module.exports = new mongoose.model("product_details", ProductSchema);
