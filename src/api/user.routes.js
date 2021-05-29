import express from "express";
import { body, validationResult } from "express-validator";
import { adminMiddleware } from "../middlewares/adminRole";
import { authenticateJwt } from "../middlewares/authorization";
import { userService } from "../services/user";

/* Init */
const router = express.Router();

router.post(
  "/register",
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  body("firstName").notEmpty(),
  body("lastName").notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await userService.register(
        req.body.email,
        req.body.firstName,
        req.body.lastName,
        req.body.password
      );
      res.json({ message: "User Created Succesfully" });
    } catch (error) {
      res.status(error.status).json({ error: error.message });
    }
  }
);

router.post(
  "/login",
  body("email").notEmpty(),
  body("password").notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const token = await userService.login(req.body.email, req.body.password);
      res.json({ token: token });
    } catch (error) {
      res.status(error.status).json({ error: error.message });
    }
  }
);

router.get(
  "/",
  authenticateJwt,
  adminMiddleware,
  async (req, res) => {
    try {
      const users = await userService.getAllUsers(res.locals.user);
      res.json(users);
    } catch (error) {
      res.status(error.status).send(error.message);
    }
  }
);

router.delete(
  "/",
  authenticateJwt,
  adminMiddleware,
  async (req, res) => {
    try {
      const user = await userService.deleteUser(req.query.id);
      res.json({message: "User Deleted Succesfully" });
    } catch (error) {
      res.status(error.status).send(error.message);
    }
  }
);

export default router;