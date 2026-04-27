const rateLimit = require("express-rate-limit");

exports.publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { msg: "Too many requests, try later" }
});