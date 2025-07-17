const jwt = require("jsonwebtoken");
function LoginValidation(req, res, next) {
  const { email, password } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

  // Email Validation
  if (!email || typeof email !== 'string' || !emailRegex.test(email)) {
    return res.status(400).json({ error: 'Enter a valid email address.' });
  }

  // Password Validation
  if (!password || typeof password !== 'string' || !passwordRegex.test(password)) {
    return res.status(400).json({
      error: 'Password must be at least 8 characters, include an uppercase letter and a number.',
    });
  }

  next();
}

function SignUpValidation(req, res, next) {
  const {
    fullName,
    email,
    password,
    DOB,
    gender,
    phoneNumber,
  } = req.body;

  // Full name
  if (
    !fullName ||
    typeof fullName !== 'string' ||
    fullName.trim().length === 0
  ) {
    return res.status(400).json({ error: 'Full name is required.' });
  }

  // Email
  if (
    !email ||
    typeof email !== 'string' ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }

  // Password (min 8 chars, 1 uppercase, 1 number)
  if (
    !password ||
    typeof password !== 'string' ||
    password.length < 8 ||
    !/[A-Z]/.test(password) ||
    !/[0-9]/.test(password)
  ) {
    return res.status(400).json({
      error:
        'Password must be at least 8 characters, include an uppercase letter and a number.',
    });
  }

  // DOB (required and must be ≥16 years old)
  if (!DOB) {
    return res.status(400).json({ error: 'Date of birth is required.' });
  }
  const birthYear = new Date(DOB).getFullYear();
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;
  if (age < 16) {
    return res.status(400).json({ error: 'You must be at least 16 years old.' });
  }

  // Gender (required)
  if (!gender || typeof gender !== 'string' || gender.trim() === '') {
    return res.status(400).json({ error: 'Gender is required.' });
  }

  // Phone number (must start with + and be 8–17 digits total)
 if (
  !phoneNumber ||
  typeof phoneNumber !== 'string' ||
  !/^\+92\d{10}$/.test(phoneNumber)
) {
  return res.status(400).json({
    error: 'Phone number must start with +92 and be exactly 13 digits long (e.g., +923001234567)',
  });
}

  next();
}


function Auth(req, res, next) {
  let token = req.headers["x-access-token"] || req.headers["authorization"];

  if (!token) {
    return res.status(403).json({ message: "Token is missing" });
  }

  if (token.startsWith("Bearer ")) {
    token = token.split(" ")[1]; // Only keep the token part
  }

  jwt.verify(token, process.env.JWT_SECRET || "mykey", (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = decoded;
    next();
  });
}
function isSuperAdmin(req, res, next) {
  if (req.user.role !== "superadmin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
}
module.exports = {
  LoginValidation,
  SignUpValidation,
  Auth,
  isSuperAdmin
};
