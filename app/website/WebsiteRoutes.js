const express = require("express");
const router = express.Router();

const userAuthenticationMiddleware = require("../User/UserAuthenticationMiddleware");
const {
  createWebsite,
  deleteWebsite,
  getAllWebsites,
} = require("./WebsiteServices");

// routes
router.get("/website", userAuthenticationMiddleware, getAllWebsites);
router.post("/website", userAuthenticationMiddleware, createWebsite);
router.delete("/website/:webId", userAuthenticationMiddleware, deleteWebsite);

module.exports = router;
