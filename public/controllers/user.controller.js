const userService = require("../services/user.service.js");

class UserController {
  async register(req, res, next) {
    const result = await userService.register(req, res, next);
    return result;
  }
  async login(req, res, next) {
    const result = await userService.login(req, res, next);
    return result;
  }
  async getUsers(req, res, next) {
    const result = await userService.getUsers(req, res, next);
    return result;
  }
  async getUser(req, res, next) {
    const id = req.params.id;
    const result = await userService.getUser(id, res, next);
    return result;
  }
  async updateUser(req, res, next) {
    const result = await userService.updateUser(req, res, next);
    return result;
  }
  async deleteUser(req, res, next) {
    const id = req.params.id;
    const result = await userService.deleteUser(id, res, next);
    return result;
  }
}

module.exports = new UserController();
