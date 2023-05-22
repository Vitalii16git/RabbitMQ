const Router = require("express").Router;
const router = new Router();
const userController = require("../controllers/user.controller.js");
const authMiddleware = require("../middlewares/auth.middleware.js");

router
  .post("/register", userController.register)
  .post("/login", userController.login)
  .get("/list", userController.getUsers)
  .get("/:id", authMiddleware, userController.getUser)
  .put("/:id", authMiddleware, userController.updateUser)
  .delete("/:id", authMiddleware, userController.deleteUser);

module.exports = router;
