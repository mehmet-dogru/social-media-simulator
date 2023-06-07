const express = require("express");
const router = express.Router();
const ROLES = require("../references/role.reference");

const userController = require("../controllers/user.controller");
const validate = require("../middlewares/validate.middleware");
const validationSchema = require("../validations/user.validation");
const authenticate = require("../middlewares/authenticate.middleware");
const authorization = require("../middlewares/authorization.middleware");

router.post("/register", validate(validationSchema.registerSchema), userController.register);
router.post("/login", validate(validationSchema.loginSchema), userController.login);
router.get("/profile", authenticate, authorization([ROLES.USER, ROLES.ADMIN]), userController.profile);
router.get("/profile/:userId", authenticate, authorization([ROLES.USER, ROLES.ADMIN]), userController.profileById);
router.get("/", authenticate, authorization([ROLES.USER, ROLES.ADMIN]), userController.list);
router.post("/update-profile-image", authenticate, authorization([ROLES.USER, ROLES.ADMIN]), userController.updateProfileImage);
router.post("/follow/:id", authenticate, authorization([ROLES.USER, ROLES.ADMIN]), userController.follow);
router.post("/unfollow/:id", authenticate, authorization([ROLES.USER, ROLES.ADMIN]), userController.unFollow);

module.exports = router;
