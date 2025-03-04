import { Router } from "express";
import {
  userRegister,
  userLogin,
  getCurrentUser,
  createTodo,
  getAllTodos,
  updateTodo,
  deleteTodo
} from "../conrollers/user.controller.js";
import { authMiddleware } from "../middelware/authMiddelware.js";

const router = Router();
router.route("/register").post(userRegister);
router.route("/login").post(userLogin);
router.route("/current-user").get(authMiddleware, getCurrentUser);
router.route("/create-todo").post(authMiddleware, createTodo);
router.route("/get-todos").get(authMiddleware, getAllTodos);
router.route("/update-todos/:id").patch(authMiddleware, updateTodo);
router.route("/delete-todos/:id").delete(authMiddleware, deleteTodo);
export default router;
