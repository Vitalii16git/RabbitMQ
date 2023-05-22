const Post = require("../models/Post.js");
const errorMessage = require("../utils/error.messages.js");

class PostService {
  async createPost(req, res, next) {
    try {
      const { title, content } = req.body;
      const post = new Post({ title, content });
      await post.save();
      res.json(post);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: errorMessage.serverError });
    }
  }

  async getPosts(req, res, next) {
    try {
      const posts = await Post.find();
      res.json(posts);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: errorMessage.serverError });
    }
  }

  async getPost(id, res, next) {
    try {
      const post = await Post.findById(id);
      if (!post) {
        return res.status(404).json({ message: errorMessage.postNotFound });
      }
      res.json(post);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: errorMessage.serverError });
    }
  }

  async updatePost(req, res, next) {
    try {
      const { title, content } = req.body;
      const post = await Post.findByIdAndUpdate(
        req.params.id,
        { new: true },
        {
          title,
          content,
        }
      );
      if (!post) {
        return res.status(404).json({ message: errorMessage.postNotFound });
      }
      res.json(post);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: errorMessage.serverError });
    }
  }

  async deletePost(id, res, next) {
    try {
      const post = await Post.findByIdAndDelete(id);
      if (!post) {
        return res.status(404).json({ message: errorMessage.postNotFound });
      }
      res.json(post);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: errorMessage.serverError });
    }
  }
}

module.exports = new PostService();
