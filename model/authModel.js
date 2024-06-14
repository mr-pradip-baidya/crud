const mongoose = require("mongoose");

const AuthSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      require: true,
    },
    password: {
      type: String,
      require: true,
    },
    gender: {
      type: String,
      require: true,
    },
    user_image: {
      type: String,
      default: "https://placehold.co/600x400",
      require: true,
    },
    identity_proof: {
      type: String,
      default: "https://placehold.co/600x400",
      require: true,
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true, versionKey: false }
);


const AuthModel = new mongoose.model("auth_details", AuthSchema);
module.exports = AuthModel;