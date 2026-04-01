const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const User = require("../models/User");

router.post("/login", async (req, res) => {
  try {
    const { email } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
  user = await User.create({ email, role: "admin" }); // ✅ FIXED
}

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, user });
  } catch (err) {
    console.error("AUTH ERROR:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

module.exports = router;