const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const cron = require("node-cron");
const axios = require("axios");
const nodemailer = require("nodemailer");

const UserRoutes = require("./app/User/UserRoutes");
const WebsiteRoutes = require("./app/website/WebsiteRoutes");
const WebsiteSchema = require("./app/website/WebsiteSchema");

const app = express();
app.use(cors());
app.use(express.json());
app.use(UserRoutes);
app.use(WebsiteRoutes);

const isWebsiteActive = async (url) => {
  const response = await axios.get(url).catch((err) => void err);
  if (!response || response.status !== 200) return false;
  return true;
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.G_EMAIL,
    pass: process.env.G_PASS,
  },
});

cron.schedule("0 */1 * * *", async () => {
  const allWebsites = await WebsiteSchema.find({}).populate({
    path: "userId",
    select: ["name", "email"],
  });
  if (!allWebsites.length) return;

  for (let i = 0; i <= allWebsites.length; ++i) {
    const website = allWebsites[i];
    const url = website.url;
    const isActive = await isWebsiteActive(url);

    WebsiteSchema.updateOne({ _id: website._id }, { isActive }).exec();
    if (!isActive && website.isActive) {
      transporter.sendMail({
        from: process.env.G_EMAIL,
        to: website.userId.email,
        subject: "Your website has gone down. Please have a look",
        text: `Your website <b> ${
          website.url
        } </b> is down. As we check on ${new Date().toLocaleString("en-in")}`,
      });
    }
  }
});

app.listen(process.env.PORT || 500, () => {
  console.log("Server is up at 5000");
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("Connection to Database is successful"))
    .catch((err) => console.log("Error while connecting to Database", err));
});
