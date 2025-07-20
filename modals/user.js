const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  username: { type: String, unique: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  DOB: Date,
  gender: String,
  phoneNumber: String,
  profileImg: String,
  coverImg: String,
  otp: String,
  otpExpiry: Date,
  role: {
    type: String,
    enum: ["user", "superadmin"],
    default: "user",
  },
  isActive: { type: Boolean, default: true },
 isDeleted: { type: Boolean, default: false }
});

userSchema.pre("save", async function (next) {
  if (this.username) return next();

  let isUnique = false;
  let generated;

  while (!isUnique) {
    const random = Math.floor(10000 + Math.random() * 90000);
    generated = `user${random}`;
    const existing = await mongoose.models.User.findOne({ username: generated });
    if (!existing) isUnique = true;
  }

  this.username = generated;
  next();
});

module.exports = mongoose.model("User", userSchema);
