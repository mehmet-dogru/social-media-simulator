const httpStatus = require("http-status");
const { passwordToHash, generateAccessToken } = require("../scripts/utils/helper");
const userService = require("../services/user.service");
const ApiError = require("../responses/error.response");
const successResponse = require("../responses/success.response");
const ROLES = require("../references/role.reference");
const path = require("path");
const cloudinary = require("cloudinary").v2;

class UserController {
  async register(req, res, next) {
    try {
      const hash = passwordToHash(req.body.password);

      const user = await userService.create({ ...req.body, password: hash });

      successResponse(res, httpStatus.OK, user);
    } catch (error) {
      return next(new ApiError(error.message, httpStatus.BAD_REQUEST));
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const hashedPassword = passwordToHash(password);

      const user = await userService.findOne({ email, password: hashedPassword });

      if (!user) {
        return next(new ApiError("Invalid email or password", httpStatus.BAD_REQUEST));
      }

      const token = generateAccessToken(user);

      successResponse(res, httpStatus.OK, token);
    } catch (error) {
      return next(new ApiError(error.message, httpStatus.BAD_REQUEST));
    }
  }

  async profile(req, res, next) {
    try {
      const user = await userService.findById(req.userId);

      if (!user) {
        return next(new ApiError("User not found", httpStatus.NOT_FOUND));
      }

      const followersCount = user.followers.length;
      const followingCount = user.following.length;

      successResponse(res, httpStatus.OK, { user, followersCount, followingCount });
    } catch (error) {
      return next(new ApiError(error.message, httpStatus.BAD_REQUEST));
    }
  }

  async profileById(req, res, next) {
    try {
      const user = await userService.findById(req.params.userId);

      if (!user) {
        return next(new ApiError("User not found", httpStatus.NOT_FOUND));
      }

      const followersCount = user.followers.length;
      const followingCount = user.following.length;

      successResponse(res, httpStatus.OK, { user, followersCount, followingCount });
    } catch (error) {
      return next(new ApiError(error.message, httpStatus.BAD_REQUEST));
    }
  }

  async list(req, res, next) {
    try {
      const { page = 1, limit = 10, role = ROLES.USER } = req.query;
      const users = await userService.list(page, limit, { role });

      successResponse(res, httpStatus.OK, users);
    } catch (error) {
      return next(new ApiError(error.message, httpStatus.BAD_REQUEST));
    }
  }

  async updateProfileImage(req, res, next) {
    try {
      let fileName;

      if (req?.files?.profileImage) {
        const extension = path.extname(req.files.profileImage.name);
        fileName = `${req.userId}${Date.now()}${extension}`;
        const folderPath = path.join(__dirname, "../", "uploads/users", fileName);

        req.files.profileImage.mv(folderPath, function (err) {
          if (err) return next(new ApiError(err.message, httpStatus.INTERNAL_SERVER_ERROR));
        });

        const result = await cloudinary.uploader.upload(folderPath, {
          use_filename: true,
          folder: "social-media-api/users",
        });

        fileName = result.secure_url;
      }

      await userService.update(req.userId, { profileImage: fileName });

      successResponse(res, httpStatus.OK, { message: "Image upload successfully" });
    } catch (error) {
      return next(new ApiError(error.message, httpStatus.BAD_REQUEST));
    }
  }

  async follow(req, res, next) {
    try {
      const userId = req.params.id;
      const followerId = req.userId;

      const userToFollow = await userService.findById(userId);

      if (!userToFollow) {
        return next(new ApiError("Kullanıcı Bulanamadı", httpStatus.NOT_FOUND));
      }

      const userToFollowFollowersList = userToFollow.followers.map((x) => x._id.toString());

      if (userToFollowFollowersList.includes(followerId.toString())) {
        return next(new ApiError("Kullanıcıyı zaten takip ediyorsunuz", httpStatus.BAD_REQUEST));
      }

      userToFollow.followers.push(followerId);
      await userToFollow.save();

      const followerUser = await userService.findById(followerId);
      followerUser.following.push(userId);
      await followerUser.save();

      successResponse(res, httpStatus.OK, {
        user: { firstName: userToFollow.firstName, lastName: userToFollow.lastName },
        message: "Kullanıcı takip edildi.",
      });
    } catch (err) {
      return next(new ApiError(err.message, httpStatus.INTERNAL_SERVER_ERROR));
    }
  }

  async unFollow(req, res, next) {
    try {
      const userId = req.params.id;
      const followerId = req.userId;

      const userToUnfollow = await userService.findById(userId);

      if (!userToUnfollow) {
        return next(new ApiError("Kullanıcı Bulanamadı", httpStatus.NOT_FOUND));
      }

      const userToUnFollowFollowersList = userToUnfollow.followers.map((x) => x._id.toString());

      if (!userToUnFollowFollowersList.includes(followerId.toString())) {
        return next(new ApiError("Kullanıcıyı zaten takip etmiyorsunuz", httpStatus.BAD_REQUEST));
      }

      userToUnfollow.followers.pull(followerId);
      await userToUnfollow.save();

      const followerUser = await userService.findById(followerId);
      followerUser.following.pull(userId);
      await followerUser.save();

      successResponse(res, httpStatus.OK, {
        user: { firstName: userToUnfollow.firstName, lastName: userToUnfollow.lastName },
        message: "Kullanıcı takipten çıkıldı",
      });
    } catch (err) {
      return next(new ApiError(err.message, httpStatus.INTERNAL_SERVER_ERROR));
    }
  }
}

module.exports = new UserController();
