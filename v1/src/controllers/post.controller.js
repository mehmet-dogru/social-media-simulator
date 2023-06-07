const httpStatus = require("http-status");
const postService = require("../services/post.service");
const userService = require("../services/user.service");
const ApiError = require("../responses/error.response");
const successResponse = require("../responses/success.response");
const path = require("path");
const sendEmail = require("../scripts/utils/send-email.utils");
const cloudinary = require("cloudinary").v2;

class PostController {
  async create(req, res, next) {
    try {
      let fileName;

      if (req?.files?.imageUrl) {
        const extension = path.extname(req.files.imageUrl.name);
        fileName = `${req.userId}${Date.now()}${extension}`;
        const folderPath = path.join(__dirname, "../", "uploads/posts", fileName);

        req.files.imageUrl.mv(folderPath, function (err) {
          if (err) return next(new ApiError(err.message, httpStatus.INTERNAL_SERVER_ERROR));
        });

        const result = await cloudinary.uploader.upload(folderPath, {
          use_filename: true,
          folder: "social-media-api/posts",
        });

        fileName = result.secure_url;
      }

      const post = await postService.create({
        author: req.userId,
        imageUrl: fileName,
        ...req.body,
      });

      successResponse(res, httpStatus.OK, post);
    } catch (error) {
      return next(new ApiError(error.message, httpStatus.BAD_REQUEST));
    }
  }

  async list(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const posts = await postService.list(page, limit);

      successResponse(res, httpStatus.OK, posts);
    } catch (error) {
      return next(new ApiError(error.message, httpStatus.BAD_REQUEST));
    }
  }

  async like(req, res, next) {
    try {
      const postId = req.params.postId;
      const userId = req.userId;

      const post = await postService.findById(postId);

      if (!post) {
        return next(new ApiError("Gönderi bulunamadı", httpStatus.NOT_FOUND));
      }

      const postLikesList = post.likes.map((x) => x._id.toString());

      if (postLikesList.includes(userId.toString())) {
        return next(new ApiError("Gönderiyi zaten beğendiniz", httpStatus.BAD_REQUEST));
      }

      post.likes.push(userId);
      await post.save();

      successResponse(res, httpStatus.OK, { message: "Gönderi beğenildi", post: post.title });
    } catch (err) {
      return next(new ApiError(err.message, httpStatus.BAD_REQUEST));
    }
  }

  async unlike(req, res, next) {
    try {
      const postId = req.params.postId;
      const userId = req.userId;

      const post = await postService.findById(postId);

      if (!post) {
        return next(new ApiError("Gönderi bulunamadı", httpStatus.NOT_FOUND));
      }

      const postLikesList = post.likes.map((x) => x._id.toString());

      if (!postLikesList.includes(userId.toString())) {
        return next(new ApiError("Gönderiyi zaten beğenmediniz", httpStatus.BAD_REQUEST));
      }

      post.likes.pull(userId);
      await post.save();

      successResponse(res, httpStatus.OK, { message: "Gönderi beğenilmekten vazgeçildi", post: post.title });
    } catch (err) {
      return next(new ApiError(err.message, httpStatus.BAD_REQUEST));
    }
  }
}

module.exports = new PostController();
