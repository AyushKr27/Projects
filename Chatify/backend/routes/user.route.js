import express from "express";
import { editprofile,getprofile,login,logout,followorUnfollow, getsuggestedusers, register } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multers.js";
const router = express.Router();
router.route('/register').post(register);
// router.route('/deleteacc').delete(isAuthenticated,deleteacc); 
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/:id/profile').get(isAuthenticated,getprofile);
router.route('/profile/edit').post(isAuthenticated,upload.single('profilepic'),editprofile);
router.route('/suggested').get(isAuthenticated,getsuggestedusers);
router.route('/followorunfollow/:id').post(isAuthenticated,followorUnfollow);

export default router;