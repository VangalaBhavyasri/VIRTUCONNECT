import { Router } from "express";
import { addToHistory, getUserHistory, login, register } from "../controllers/user.controller.js";
const router = Router();
router.route("/login").post(login)
router.route("/register").post(register)
router.route("/add_to_activity").post((req, res, next) => {
    console.log("Route '/add_to_activity' is accessed.");
    next(); 
}, addToHistory);
router.route("/get_all_activity").get(getUserHistory)
export default router;