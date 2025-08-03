const express = require("express")
const dotenv = require("dotenv")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const cors = require('cors');

const app = express()
app.use(cors()); 

app.use(express.json())
dotenv.config()



mongoose.connect(process.env.MONGO_URL)
.then(() => {
    console.log("mongodb connected successfully")
})
.catch((error) => {
    console.log(`error: ${error}`)
})

app.listen(5000,() => {
    console.log("server is running at port 5000")
})

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});


const UserModel = mongoose.model("Users",userSchema)


const sessionSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  title: { 
    type: String,
    required: true 
  },
  tags: { 
    type: [String],
    default: [] 
  },
  status: { 
    type: String,
    enum: ['draft', 'published'],
    default: 'draft' 
  },
  created_at: { 
    type: Date,
    default: Date.now 
  },
  updated_at: { 
    type: Date,
    default: Date.now 
  }
});

const SessionModel = mongoose.model("sessions", sessionSchema)


const logger = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  let jwtToken;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    jwtToken = authHeader.split(" ")[1];
  }

  if (!jwtToken) {
    return res.status(401).json({ error: "Invalid Token" });
  }

  jwt.verify(jwtToken, "JWT-TOKEN", (error, payload) => {
    if (error) {
      return res.status(401).json({ error: "Invalid Token" });
    } else {
      req.email = payload.email;
      next();
    }
  });
};



app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }
  const existingUser = await UserModel.findOne({ email: email });
  if (existingUser) {
    return res.status(409).json({ error: "User already exists" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new UserModel({
    email: email,
    password_hash: hashedPassword,
  });
  await newUser.save();
  return res.status(201).json({ message: "User created successfully" ,ok:true});
});



app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" ,ok:false});
  }
  const user = await UserModel.findOne({ email: email });
  if (!user) {
    return res.status(401).json({ error: "User does not exist",ok:false });
  }
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ error: "Invalid password",ok:false });
  }
  const payload = {
    email:email
  }
  const jwtToken =  jwt.sign(payload,"JWT-TOKEN")
  
  return res.status(200).json({ ok: true,token :jwtToken })
});



app.post("/my-sessions/save-draft", logger, async (req, res) => {
  const { title, tags, status } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  const user = await UserModel.findOne({ email: req.email });
  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }

  const session = new SessionModel({
    user_id: user._id,
    title,
    tags: Array.isArray(tags) ? tags : [],
    status: status === "published" ? "published" : "draft",
  });

  await session.save();

  return res.status(201).json({ message: "Session draft saved successfully", session });
});



app.get("/sessions", async (req, res) => {
  const publishedSessions = await SessionModel.find({ status: "published" });
  return res.status(200).json(publishedSessions);
});


app.get("/my-sessions", logger, async (req, res) => {
  const email = req.email;

  const user = await UserModel.findOne({ email: email });
  
  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }

  const sessions = await SessionModel.find({ user_id: user._id });
  
  return res.status(200).json(sessions);
});



app.get("/my-sessions/:id", logger, async (req, res) => {
  const sessionId = req.params.id;
  const email = req.email;

  const user = await UserModel.findOne({ email: email });
  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }

  const session = await SessionModel.findOne({ _id: sessionId, user_id: user._id });
  if (!session) {
    return res.status(404).json({ error: "Session not found or access denied" });
  }

  return res.status(200).json(session);
});


app.post("/my-sessions/save-draft", logger, async (req, res) => {
  const { title, tags, status, _id } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  const user = await UserModel.findOne({ email: req.email });
  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }

  let session;
  if (_id) {
    session = await SessionModel.findOneAndUpdate(
      { _id: _id, user_id: user._id },
      {
        title,
        tags: Array.isArray(tags) ? tags : [],
        status: status === "published" ? "published" : "draft",
        updated_at: new Date()
      },
      { new: true }
    );
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
  } else {
    session = new SessionModel({
      user_id: user._id,
      title,
      tags: Array.isArray(tags) ? tags : [],
      status: status === "published" ? "published" : "draft"
    });
    await session.save();
  }

  return res.status(201).json({ message: "Session draft saved successfully", session });
});


app.post("/my-sessions/publish", logger, async (req, res) => {
  const { _id } = req.body;

  if (!_id) {
    return res.status(400).json({ error: "Session id is required" });
  }

  const user = await UserModel.findOne({ email: req.email });
  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }

  const session = await SessionModel.findOneAndUpdate(
    { _id: _id, user_id: user._id },
    { status: "published", updated_at: new Date() },
    { new: true }
  );

  if (!session) {
    return res.status(404).json({ error: "Session not found or access denied" });
  }

  return res.status(200).json({ message: "Session published successfully", session });
});





module.exports = app