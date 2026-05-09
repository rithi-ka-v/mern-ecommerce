const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");

// ================= REGISTER =================
const registerUser = async (req, res) => {
  const { userName, email, password } = req.body;

  try {
    // ✅ 1. VALIDATION (VERY IMPORTANT)
    if (!userName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // ✅ 2. CHECK EXISTING USER
    const checkUser = await User.findOne({ email });

    if (checkUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // ✅ 3. HASH PASSWORD
    const hashPassword = await bcrypt.hash(password, 12);

    // ✅ 4. CREATE USER
    const newUser = new User({
      userName,
      email,
      password: hashPassword,
      role: "user", // optional but good
    });

    await newUser.save();

    // ✅ 5. SUCCESS RESPONSE
    return res.status(201).json({
      success: true,
      message: "Registration successful",
    });

  } catch (error) {
    console.log("REGISTER ERROR:", error); // 🔥 debug
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ================= LOGIN =================
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // ✅ VALIDATION
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // ✅ CHECK USER
    const checkUser = await User.findOne({ email });

    if (!checkUser) {
      return res.status(404).json({
        success: false,
        message: "User doesn't exist! Please register first",
      });
    }

    // ✅ CHECK PASSWORD
    const isMatch = await bcrypt.compare(password, checkUser.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

    // ✅ GENERATE TOKEN
    const token = jwt.sign(
      {
        id: checkUser._id,
        role: checkUser.role,
        email: checkUser.email,
        userName: checkUser.userName,
      },
      process.env.JWT_SECRET,
      { expiresIn: "60m" }
    );

    // ✅ SET COOKIE
   res.cookie("token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 60 * 60 * 1000,
});

    // ✅ RESPONSE
    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      user: {
        id: checkUser._id,
        email: checkUser.email,
        role: checkUser.role,
        userName: checkUser.userName,
      },
    });

  } catch (error) {
    console.log("LOGIN ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ================= LOGOUT =================
const logoutUser = (req, res) => {
 res.clearCookie("token", {
  httpOnly: true,
  secure: true,
  sameSite: "none",
});
  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

// ================= AUTH MIDDLEWARE =================
const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized user",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized user",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
};