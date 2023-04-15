const mongoose = require("mongoose");

const Schema = new mongoose.Schema(
  {
    name: {
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
    tokens: {
      accessToken: {
        token: String,
        expireAt: Date
      },
      refreshToken: {
        token:String,
        expireAt:Date
      },
    },
  },
  {
    timestamps: true,
  }
);

const UserSchema = mongoose.model("User", Schema);

module.exports=UserSchema;
