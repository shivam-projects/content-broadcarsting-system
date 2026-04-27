const express = require("express");
const cors = require("cors");
const app = express();
const usersRoute = require("./routes/users")
const contentRoute = require("./routes/content")
const approvalRoute = require("./routes/action")

app.use(express.json());
app.use(cors());

app.use("/auth", usersRoute);
app.use("/content", contentRoute);
app.use("/approval", approvalRoute);

module.exports = app;