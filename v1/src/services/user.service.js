const BaseService = require("./base.service");
const BaseModel = require("../models/User");

class UserService extends BaseService {
  constructor() {
    super(BaseModel);
  }

  findById(id) {
    return this.BaseModel.findById(id)
      .populate({
        path: "followers",
        select: "firstName lastName",
      })
      .populate({
        path: "following",
        select: "firstName lastName",
      })
      .populate({
        path: "sharedPosts",
        select: "title content imageUrl",
      });
  }

  list(page, limit, where) {
    const allUsers = BaseModel.find(where || {})
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate({
        path: "followers",
        select: "firstName lastName",
      })
      .populate({
        path: "following",
        select: "firstName lastName",
      })
      .populate({
        path: "sharedPosts",
        select: "title content imageUrl",
      });

    return allUsers;
  }
}

module.exports = new UserService();
