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

Schema.pre("save", function (next) {
  this.isActive = true;
  next();
});

Schema.index({ url: 1 }, { unique: true });

const WebsiteSchema = mongoose.model("Website", Schema);

module.exports = WebsiteSchema;
