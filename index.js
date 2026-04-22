const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// 🔗 MongoDB Connection (Atlas)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));


// 📦 Student Schema
const studentSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  course: String,
});

const Student = mongoose.model("Student", studentSchema);


// 🔒 Auth Middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ msg: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
};


// 🟢 Register API
app.post("/api/register", async (req, res) => {
  const { name, email, password, course } = req.body;

  try {
    const existingUser = await Student.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStudent = new Student({
      name,
      email,
      password: hashedPassword,
      course,
    });

    await newStudent.save();

    res.json({ msg: "Registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 🔵 Login API
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Student.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 🟡 Update Password
app.put("/api/update-password", authMiddleware, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await Student.findById(req.user.id);

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Old password incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    res.json({ msg: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 🟣 Update Course
app.put("/api/update-course", authMiddleware, async (req, res) => {
  const { course } = req.body;

  try {
    const user = await Student.findById(req.user.id);

    user.course = course;
    await user.save();

    res.json({ msg: "Course updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 🟠 Dashboard (Protected)
app.get("/api/dashboard", authMiddleware, async (req, res) => {
  try {
    const user = await Student.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 🚀 Server Start
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});