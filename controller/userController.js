const User = require("../modals/user");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
require("dotenv").config();
const path = require('path');
const fs = require('fs');

async function signup(req, res) {
  try {
    const {
      fullName,
      email,
      password,
      DOB,
      gender,
      phoneNumber,
    } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    });
    if (existingUser) {
      return res.status(400).send("User already exists!");
    }
    console.log("Signup API called");
    console.log("Files received:", req.files);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const DEFAULT_PROFILE_IMG = "/defaults/default-profile.png";
const DEFAULT_COVER_IMG = "/defaults/default-cover.png";

// Use uploaded file paths or defaults
const profileImgPath = req.files["profileImg"]
  ? `/uploads/${req.files["profileImg"][0].filename}`
  : DEFAULT_PROFILE_IMG;

const coverImgPath = req.files["coverImg"]
  ? `/uploads/${req.files["coverImg"][0].filename}`
  : DEFAULT_COVER_IMG;

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      DOB,
      gender,
      phoneNumber,
      profileImg: profileImgPath,
      coverImg: coverImgPath,
    });

    await newUser.save();
    res.status(201).send("User registered successfully");
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).send("Internal server error");
  }
}
// let signupCache = {};
// async function sendSignupOtp(req, res) {
//   try {
//     const {
//       fullName, email, password, DOB, gender, phoneNumber,
//     } = req.body;

//     const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });
//     if (existingUser) return res.status(400).send("User already exists!");

//     // Generate OTP
//     const otp = Math.floor(1000 + Math.random() * 9000).toString();

//     // Hash password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // Save user data temporarily in memory
//     signupCache[email] = {
//       fullName,
//       email,
//       password: hashedPassword,
//       DOB,
//       gender,
//       phoneNumber,
//       otp,
//       otpExpiry: Date.now() + 5 * 60 * 1000 // 5 minutes
//     };

//     // Send OTP to email
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     await transporter.sendMail({
//       to: email,
//       subject: "Signup OTP Verification",
//       html: `<p>Your OTP is <b>${otp}</b>. It expires in 5 minutes.</p>`,
//     });

//     res.status(200).send("OTP sent to your email.");
//   } catch (error) {
//     console.error("Send OTP error:", error);
//     res.status(500).send("Internal server error");
//   }
// }
// async function verifySignupOtp(req, res) {
//   const { email, otp } = req.body;
//   const data = signupCache[email];

//   if (!data) return res.status(400).send("OTP not requested.");
//   if (data.otp !== otp || Date.now() > data.otpExpiry) {
//     return res.status(400).send("Invalid or expired OTP.");
//   }

//   const DEFAULT_PROFILE_IMG = "/defaults/default-profile.png";
//   const DEFAULT_COVER_IMG = "/defaults/default-cover.png";

//   const newUser = new User({
//     fullName: data.fullName,
//     email: data.email,
//     password: data.password,
//     DOB: data.DOB,
//     gender: data.gender,
//     phoneNumber: data.phoneNumber,
//     profileImg: DEFAULT_PROFILE_IMG,
//     coverImg: DEFAULT_COVER_IMG,
//     isActive: true
//   });

//   await newUser.save();
//   delete signupCache[email]; // Clean up temporary cache

//   res.status(201).send("User registered successfully.");
// }


async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    console.log("This return full object", user)

    if (!user) {
      return res.status(401).json({ message: "Invalid email" });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }
      if (!user.isActive) {
    return res.status(403).json({ message: 'User is not allowed to login' }); // 👈 BLOCK INACTIVE USER
  }
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, },
      process.env.JWT_SECRET || "mykey",
      { expiresIn: "1h" }
    );
    res.json({
      message: "Login successful",
      token,
      email: user.email
    });

  } catch (error) {
    res.status(500).json({
      message: "Login error",
      error: error.message,
    });
  }
}

async function forgotPassword(req, res) {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.otp = otp;
    user.otpExpiry = Date.now() + 1000 * 60 * 5;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      to: user.email,
      subject: "Your OTP for Password Reset",
      html: `<p>Your OTP for password reset is <b>${otp}</b>.</p>
             <p>This OTP will expire in 5 minutes.</p>`,
    });

    res.status(200).send({ message: "OTP sent to your email." });
  } catch (error) {
    console.error("Forgot password OTP error:", error);
    res.status(500).send({ message: "Internal server error" });
  }
}


async function verifyOtp(req, res) {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({
      email,
      otp,
      otpExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).send({ message: "Invalid or expired OTP" });
    }

    res.status(200).send({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).send({ message: "Internal server error" });
  }
}

async function resetPassword(req, res) {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Hash the new password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.send("Password updated successfully");
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).send("Internal server error");
  }
}

const getUser = async (req, res) => {
 const userId = req.user._id || req.user.id; // depending on your middleware

    const user = await User.findById(userId).select('-password -otp -otpExpiry');
    console.log(user)

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userObj = user.toObject();
    console.log(userObj)
  
    res.status(200).json(userObj);
};
const updateProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Delete old profile image if exists
    if (user.profileImg) {
      const oldPath = path.join(__dirname, '..', 'uploads', user.profileImg);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    user.profileImg = `/uploads/${req.file.filename}`;
    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
const updateCoverImage = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Delete old cover image if exists
    if (user.coverImg) {
      const oldPath = path.join(__dirname, '..', user.coverImg); // already starts with /uploads/...
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    // Save new cover image
    user.coverImg = `/uploads/${req.file.filename}`;
    await user.save();

    res.json(user);
  } catch (error) {
    console.error('Error updating cover image:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  // sendSignupOtp,
  // verifySignupOtp,
  signup,
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
  getUser,
  updateProfileImage,
  updateCoverImage
};
