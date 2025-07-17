const express = require("express");
const {signup,login,forgotPassword,verifyOtp,resetPassword,  getUser , updateCoverImage, updateProfileImage, getAllUsers, toggleUser} = require("../controller/userController");
const { SignUpValidation, LoginValidation, Auth, isSuperAdmin } = require("../middleware/middleware");
const upload = require("../middleware/upload");


const router = express.Router();

router.post("/signup", upload.fields([
  { name: "profileImg", maxCount: 1 },
  { name: "coverImg", maxCount: 1 },
]), SignUpValidation, signup);

router.post("/login", LoginValidation, login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp); 
router.post("/reset-password", resetPassword);
router.get('/get-user', Auth, getUser)
router.put('/update-profile-image', Auth,upload.single('profileImg'), updateProfileImage);
router.put('/update-cover-image', Auth, upload.single('coverImg'), updateCoverImage);
router.get('/get-all-users', Auth,isSuperAdmin, getAllUsers);
router.put('/toggle-user/:id', Auth, toggleUser)

module.exports = router;
