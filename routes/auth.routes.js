// routes/auth.routes.js
import { Router } from "express";
import { login, logout, refreshAccessToken, register } from "../controller/auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", logout);

export default router;
