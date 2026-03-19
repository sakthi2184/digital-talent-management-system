const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,
    });

    await user.save();

    console.log("REGISTERED:", user);

    res.json({ message: "User registered" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});


// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    console.log("LOGIN EMAIL:", normalizedEmail);

    const user = await User.findOne({ email: normalizedEmail });

    console.log("FOUND USER:", user);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const token = jwt.sign({ id: user._id }, "secretkey");

    res.json({ token });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;