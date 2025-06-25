const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Groq = require("groq-sdk");
const { exec } = require("child_process");
const { env } = require("process");
require("dotenv").config();
const app = express();
app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  "https://mental-health-r9h9.onrender.com",
  "https://mental-health-jainamshah2425s-projects.vercel.app", // Removed trailing slash
  "https://mental-health-pi-beige.vercel.app",
  "https://mental-health-git-main-jainamshah2425s-projects.vercel.app"
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin); // For debugging
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));
const mongoUri = process.env.MONGODB_URI ;

mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

const JWT_SECRET = process.env.JWT_SECRET;
const GROQ_API_KEY = process.env.GROQ_API_KEY; // Your Grok API key
const groq = new Groq({ apiKey: GROQ_API_KEY });

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  age: { type: Number },
  gender: { type: String },
  dailyRoutine: { type: String },
  createdAt: { type: Date, default: Date.now },
  interactions: [
    {
      timestamp: { type: Date, default: Date.now },
      textInput: String,
      voiceInput: String,
      distressScore: Number,
      suggestedAction: String,
    },
  ],
});

const User = mongoose.model("User", userSchema);

// Admin Schema
const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "admin" },
});

const Admin = mongoose.model("Admin", adminSchema);

// Post Schema
const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Optional: link to user
  text: { type: String, required: true },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  comments: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

const Post = mongoose.model("Post", postSchema);

// Chat Message Schema
const chatMessageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Optional: link to user
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);

// Middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access denied" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Admin access required" });
  next();
};

// Utility Functions
const speechToText = async audioData => {
  return Promise.resolve("I feel stressed today"); // Placeholder
};

const analyzeDistress = async text => {
  const keywords = ["stressed", "anxious", "tired", "overwhelmed"];
  const distressScore = keywords.some(word => text.toLowerCase().includes(word)) ? 70 : 20;
  const suggestedAction =
    distressScore > 50 ? "Try a 5-minute breathing exercise" : "Write a journal entry";
  return { distressScore, suggestedAction };
};

const filterText = text => {
  const badWords = ["hate", "stupid", "idiot", "damn", "hell"];
  let filteredText = text;
  badWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    filteredText = filteredText.replace(regex, "****");
  });
  return filteredText;
};

// User Routes
app.post("/api/signup", async (req, res) => {
  const { email, password, name, age, gender, dailyRoutine } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, name, age, gender, dailyRoutine });
    await user.save();
    res.status(201).json({ message: "User created" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/interact", authenticateToken, async (req, res) => {
  const { textInput, voiceInput } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    let finalText = textInput;
    if (voiceInput) {
      finalText = await speechToText(voiceInput);
    }

    const { distressScore, suggestedAction } = await analyzeDistress(finalText);
    user.interactions.push({ textInput, voiceInput: finalText, distressScore, suggestedAction });
    await user.save();

    res.json({
      message: "Interaction recorded",
      response: suggestedAction,
      distressScore,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Routes
app.post("/api/admin/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({ email, password: hashedPassword });
    await admin.save();
    res.status(201).json({ message: "Admin created" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/admin/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: admin._id, email: admin.email, role: "admin" }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token, admin: { id: admin._id, email: admin.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/admin/patients", authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/admin/patients/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Posts Routes
app.get("/api/posts", authenticateToken, async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/posts", authenticateToken, async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Text is required" });
  try {
    const post = new Post({
      userId: req.user.id,
      text: filterText(text),
    });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/posts/:id/upvote", authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    post.upvotes += 1;
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/posts/:id/downvote", authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    post.downvotes += 1;
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/posts/:id/comments", authenticateToken, async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Comment text is required" });
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    post.comments.push(filterText(text));
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Chat Routes
app.get("/api/chat", authenticateToken, async (req, res) => {
  try {
    const messages = await ChatMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/chat", authenticateToken, async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Text is required" });
  try {
    const message = new ChatMessage({
      userId: req.user.id,
      text: filterText(text),
    });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Grok Chat Endpoint
app.post("/api/chat-with-grok", authenticateToken, async (req, res) => {
  const { message } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!message) {
      const chatHistory = user.interactions.map(interaction => ({
        role: "user",
        content: interaction.textInput || interaction.voiceInput,
      }));

      const messages = [
        {
          role: "system",
          content: `
            You are a helpful mental health assistant. Analyze the user's chat history and provide insights in the following JSON format:
            {
              "response": "Your reply to the user",
              "insights": {
                "mood_trend": "positive/negative/stable",
                "distress_level": number (0-100),
                "trigger_keywords": ["keyword1", "keyword2"],
                "suggested_action": "Recommended coping strategy",
                "timeline_data": [
                  {"date": "YYYY-MM-DD", "mood_score": number (-100 to 100), "note": "Brief note"}
                ]
              }
            }
          `,
        },
        ...chatHistory,
        {
          role: "user",
          content: "Please analyze my recent interactions and provide insights.",
        },
      ];

      const chatCompletion = await groq.chat.completions.create({
        messages,
        model: "llama-3.3-70b-versatile",
        temperature: 0.5,
        max_completion_tokens: 1024,
        top_p: 1,
        stop: null,
        stream: false,
      });

      const grokResponse = chatCompletion.choices[0]?.message?.content || "{}";
      return res.json(grokResponse);
    }

    const { distressScore, suggestedAction } = await analyzeDistress(message);
    const userInteraction = {
      timestamp: new Date(),
      textInput: message,
      distressScore,
      suggestedAction: "Processing...",
    };
    user.interactions.push(userInteraction);
    await user.save();

    const recentInteractions = user.interactions
      .slice(-5)
      .map(interaction => [
        { role: "user", content: interaction.textInput || interaction.voiceInput },
        { role: "assistant", content: interaction.suggestedAction },
      ])
      .flat();

    const messages = [
      {
        role: "system",
        content: `
          You are a helpful mental health assistant. Respond to the user's message naturally and provide a helpful reply based on the conversation history. Return the response in the following JSON format:
          {
            "response": "Your reply to the user",
            "distressScore": number (0-100),
            "suggestedAction": "Recommended coping strategy"
          }
        `,
      },
      ...recentInteractions,
      { role: "user", content: message },
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_completion_tokens: 1024,
      top_p: 1,
      stop: null,
      stream: false,
    });

    const grokResponse = chatCompletion.choices[0]?.message?.content || "{}";
    userInteraction.suggestedAction = grokResponse || suggestedAction;
    await user.save();

    res.json({
      response: grokResponse || "I’m here to help. How can I assist you?",
      distressScore,
      suggestedAction: grokResponse || suggestedAction,
    });
  } catch (error) {
    console.error("Grok API error:", error);
    res.status(500).json({ error: "Failed to process chat with Grok" });
  }
});

// Chat Timeline Endpoint
app.post("/api/chat-timeline", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const chatHistory = user.interactions.map(interaction => ({
      role: "user",
      content: interaction.textInput || interaction.voiceInput,
    }));

    const messages = [
      {
        role: "system",
        content: `
          You are a helpful mental health assistant. Analyze the user's chat history and provide insights in the following JSON format only:
          {
            "response": "Your reply to the user",
            "insights": {
              "mood_trend": "positive/negative/stable",
              "distress_level": number (0-100),
              "trigger_keywords": ["keyword1", "keyword2"],
              "suggested_action": "Recommended coping strategy",
              "timeline_data": [
                {"date": "YYYY-MM-DD", "mood_score": number (-100 to 100), "note": "Brief note"}
              ]
            }
          }
        `,
      },
      ...chatHistory,
      {
        role: "user",
        content: "Please analyze my recent interactions and provide insights.",
      },
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_completion_tokens: 1024,
      top_p: 1,
      stop: null,
      stream: false,
    });

    const grokResponse = chatCompletion.choices[0]?.message?.content || "{}";
    console.log("Raw response from Grok API:", grokResponse);
    res.send(grokResponse);
  } catch (error) {
    console.error("Grok API error in /api/chat-timeline:", error);
    res.status(500).json({ error: "Failed to process timeline analysis" });
  }
});

// WhatsApp Endpoint
app.post("/api/run-whatsapp", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const scriptPath = `${__dirname}/scripts/whatsapp.py`;
    exec(`python "${scriptPath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing WhatsApp script: ${error.message}`);
        return res
          .status(500)
          .json({ error: "Failed to run WhatsApp script", details: error.message });
      }
      if (stderr) {
        console.error(`Script stderr: ${stderr}`);
        return res.status(500).json({ error: "WhatsApp script error", details: stderr });
      }
      console.log(`Script output: ${stdout}`);
      res.json({ message: "WhatsApp script started successfully", output: stdout });
    });
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// Seed Initial Data (Optional: Run once to populate database)
const seedData = async () => {
  const postCount = await Post.countDocuments();
  if (postCount === 0) {
    await Post.insertMany([
      {
        text: "Why did the scarecrow become a motivational speaker? Because he was outstanding in his field! 😄",
        upvotes: 12,
        downvotes: 2,
        comments: ["Haha, that’s a good one!", "Love this joke!"],
        createdAt: new Date(Date.now() - 3600000),
      },
      {
        text: "Feeling a bit overwhelmed with work... any tips for managing stress?",
        upvotes: 8,
        downvotes: 1,
        comments: ["Try taking short breaks every hour!", "Deep breathing helps me a lot."],
        createdAt: new Date(Date.now() - 1800000),
      },
      {
        text: "Just played the Happy Face Game and it really cheered me up! 🎉",
        upvotes: 5,
        downvotes: 0,
        comments: ["Same! It’s so fun!"],
        createdAt: new Date(Date.now() - 600000),
      },
    ]);
    console.log("Initial posts seeded");
  }

  const chatCount = await ChatMessage.countDocuments();
  if (chatCount === 0) {
    await ChatMessage.insertMany([
      {
        text: "Hey everyone, just wanted to say you’re all awesome!",
        createdAt: new Date(Date.now() - 3000000),
      },
      { text: "Thanks! I needed that today. 😊", createdAt: new Date(Date.now() - 2400000) },
      {
        text: "Has anyone tried the new Snake Game? It’s super relaxing!",
        createdAt: new Date(Date.now() - 1200000),
      },
      {
        text: "I’m feeling a bit anxious... any suggestions?",
        createdAt: new Date(Date.now() - 300000),
      },
      {
        text: "Try the Breathing Exercise game! It really helps me calm down.",
        createdAt: new Date(Date.now() - 60000),
      },
    ]);
    console.log("Initial chat messages seeded");
  }
};
seedData();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
