const postService = require("../services/post.service.js");

class PostController {
  async createPost(req, res, next) {
    const result = await postService.createPost(req, res, next);
    return result;
  }
  async getPosts(req, res, next) {
    const result = await postService.getPosts(req, res, next);
    return result;
  }
  async getPost(req, res, next) {
    const id = req.params.id;
    const result = await postService.getPost(id, res, next);
    return result;
  }
  async updatePost(req, res, next) {
    const result = await postService.updatePost(req, res, next);
    return result;
  }
  async deletePost(req, res, next) {
    const id = req.params.id;
    const result = await postService.deletePost(id, res, next);
    return result;
  }
}

module.exports = new PostController();
