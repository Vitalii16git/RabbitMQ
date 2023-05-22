const Router = require("express").Router;
const router = new Router();
const postController = require("../controllers/post.controller.js");
const authMiddleware = require("../middlewares/auth.middleware.js");

router
  .post("/create", authMiddleware, postController.createPost)
  .get("/list", postController.getPosts)
  .get("/:id", authMiddleware, postController.getPost)
  .put("/:id", authMiddleware, postController.updatePost)
  .delete("/:id", authMiddleware, postController.deletePost);

module.exports = router;
