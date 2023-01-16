/** @format */

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
const mysql = require("./Config/db_config");
const cloudinary = require("cloudinary");
const fileUpload = require("express-fileupload");

// Initializing APP ...
const app = express();

// Routes ...
const UserRoute = require("./Routes/UserRoutes");

// Middlewares ...
app.use(cors());
app.use(morgan("tiny"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// Home Route ...
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Lattice Innovations !",
  });
});

// Router Middlewares ...
app.use("/api/v1", UserRoute);

// cloudinary config ...
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Server Listening ...
app.listen(process.env.PORT, () => {
  console.log(`Server is listening on Port@ ${process.env.PORT}`);
});
