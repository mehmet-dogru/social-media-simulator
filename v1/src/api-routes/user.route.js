const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const validate = require("../middlewares/validate.middleware");
const validationSchema = require("../validations/user.validation");
const authenticate = require("../middlewares/authenticate.middleware");
const authorization = require("../middlewares/authorization.middleware");

router.post("/register", validate(validationSchema.registerSchema), userController.register);
router.post("/login", validate(validationSchema.loginSchema), userController.login);
router.get("/profile", authenticate, userController.profile);
router.get("/profile/:userId", authenticate, userController.profileById);
router.get("/", authenticate, userController.list);
router.post("/update-profile-image", authenticate, userController.updateProfileImage);
router.post("/follow/:id", authenticate, userController.follow);
router.post("/unfollow/:id", authenticate, userController.unFollow);

module.exports = router;
