const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
  url: {
    type: String,
    require: true,
  },
  userId: {
    type: mongoose.Types.ObjectId,
    require: true,
    ref:"User"
  },
  isActive: {
    type: Boolean,
  },
});

const WebsiteSchema = mongoose.model("Website", Schema);

module.exports = WebsiteSchema;
