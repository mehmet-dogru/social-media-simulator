const express = require("express");
const router = express.Router();

const postController = require("../controllers/post.controller");
const validate = require("../middlewares/validate.middleware");
const validationSchema = require("../validations/post.validation");
const authenticate = require("../middlewares/authenticate.middleware");
const authorization = require("../middlewares/authorization.middleware");
const ROLES = require("../references/role.reference");

router.route("/").post(authenticate, authorization([ROLES.USER, ROLES.ADMIN]), validate(validationSchema.createPostSchema), postController.create);
router.route("/").get(authenticate, authorization([ROLES.USER, ROLES.ADMIN]), postController.list);
router.route("/like/:postId").post(authenticate, postController.like);
router.route("/unlike/:postId").post(authenticate, postController.unlike);
router.route("/feed").get(authenticate, postController.postsFromFollowedUsers);
router.route("/retweet/:postId").post(authenticate, postController.retweet);

module.exports = router;
