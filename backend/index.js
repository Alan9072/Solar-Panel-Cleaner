import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from "cors";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from "cookie-parser";
import user from './Models/User.js';

const corsOptions = {
  origin: 'http://localhost:5173',  // Your frontend URL
  credentials: true  // Allow cookies to be sent
};

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("db connected successfully");
  })
  .catch((err) => {
    console.log("db not yet connected : "+ err);
  });

// Middleware
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
    res.send('Server is running!');
});

app.post("/register", async (req, res) => {
  const { name, username, password } = req.body;
  console.log(req.body);
  

  try {
    const existingUser = await user.findOne({ username });
    if (existingUser) {
        return res.send({ message: 'Username already exists' });
      }
  
      // Hash the password using bcrypt
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Create a new user
      const newUser = new user({
        name,
        username,
        password: hashedPassword
      });
  
      // Save the user to the database
      await newUser.save();
  
      // Send success response
      return res.send({ message: 'verified' });
  
    } catch (err) {
      console.error(err);
      res.send({ message: 'Server error. Please try again later.' });
    }
});



app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const existingUser = await user.findOne({ username });
    if (existingUser) {
      // Compare the provided password with the hashed password
      const isMatch = await bcrypt.compare(password, existingUser.password);
      if (isMatch) {
        
        var token = jwt.sign({ username: username }, process.env.SECRET);
       
        res.cookie("token",token);

        return res.send({ message: 'verified' });
      } else {
        return res.send({ message: 'Incorrect password' });
      }
    } else {
      return res.send({ message: 'Username not found' });
    }
  } catch (error) {
    console.error(error);
    res.send({ message: 'Server error. Please try again later.' });
  }
});

app.post("/logout", (req, res) => {
  try {
    // Clear the token cookie
    res.clearCookie("token");
    return res.send({ message: 'Logged out successfully' });
  } catch (error) {
    console.error(error);
    res.send({ message: 'Server error. Please try again later.' });
  }
});

app.get("/verify", (req, res) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).send({ message: 'No token provided', verified: false });
    }

    // Verify the JWT token
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: 'Invalid or expired token', verified: false });
      }
      
      // Token is valid
      return res.send({ message: 'Token verified', verified: true, username: decoded.username });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Server error. Please try again later.', verified: false });
  }
});

// Get current logged-in user
app.get("/api/user/me", async (req, res) => {
  try {
    const token = req.cookies.token;
    console.log("Token from cookies:", token);

    if (!token) {
      return res.status(401).send({ message: "Not authenticated" });
    }

    // Verify JWT
    jwt.verify(token, process.env.SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: "Invalid or expired token" });
      }

      // Find user in DB
      const existingUser = await user.findOne({ username: decoded.username }).select("-password"); // exclude password
      if (!existingUser) {
        return res.status(404).send({ message: "User not found" });
      }

      return res.send(existingUser);
    });
  } catch (error) {
    res.status(500).send({ message: "Server error. Please try again later." });
  }
});


// Start server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});