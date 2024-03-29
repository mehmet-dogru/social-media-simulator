const BaseService = require("./base.service");
const BaseModel = require("../models/Post");

class PostService extends BaseService {
  constructor() {
    super(BaseModel);
  }

  list(page, limit, where) {
    const allPosts = BaseModel.find(where || {})
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate({
        path: "author",
        select: "firstName lastName profileImage",
      })
      .populate({
        path: "likes",
        select: "firstName lastName",
      })
      .populate({
        path: "retweets",
        select: "firstName lastName",
      });

    return allPosts;
  }
}

module.exports = new PostService();
