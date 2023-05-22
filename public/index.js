require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const userRouter = require("./routes/user.router.js");
const postRouter = require("./routes/post.router.js");

const app = express();
const PORT = process.env.PORT || 5555;

app.use(bodyParser.json());
app.use(cors());
app.use("/api/user", userRouter);
app.use("/api/post", postRouter);

const start = async () => {
  await mongoose
    .connect(process.env.MONGO_URL, { useNewUrlParser: true })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log(err));

  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
};

start();
