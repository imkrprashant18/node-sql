import { Router } from "express";
import {
  userRegister,
  userLogin,
  getCurrentUser,
} from "../conrollers/user.controller.js";
import { authMiddleware } from "../middelware/authMiddelware.js";

const router = Router();

router.route("/register").post(userRegister);
router.route("/login").post(userLogin);
router.route("/current-user").get(authMiddleware, getCurrentUser);
export default router;
