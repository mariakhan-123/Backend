const express = require("express");
const {signup, login,forgotPassword, verifyOtp, resetPassword, getUser, updateCoverImage, updateProfileImage, sendSignupOtp,verifySignupOtp} = require("../controller/userController");
const {getAllUsers, toggleUser, softDeleteUser, editUser} = require("../controller/superadminController");
const { SignUpValidation, LoginValidation, Auth, isSuperAdmin } = require("../middleware/middleware");
const upload = require("../middleware/upload");
const router = express.Router();

router.post("/signup", upload.fields([{ name: "profileImg", maxCount: 1 },{ name: "coverImg", maxCount: 1 },]), SignUpValidation, signup);
// router.post('/send-signup-otp', sendSignupOtp);
// router.post('/verify-signup-otp', verifySignupOtp);
router.post("/login", LoginValidation, login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp); 
router.post("/reset-password", resetPassword);
router.get('/get-user', Auth, getUser)
router.put('/update-profile-image', Auth,upload.single('profileImg'), updateProfileImage);
router.put('/update-cover-image', Auth, upload.single('coverImg'), updateCoverImage);
router.get('/get-all-users', Auth,isSuperAdmin, getAllUsers);
router.put('/toggle-user/:id', Auth, toggleUser)
router.patch('/:id/delete', softDeleteUser)
router.put('/edit/:id', editUser);
module.exports = router;
