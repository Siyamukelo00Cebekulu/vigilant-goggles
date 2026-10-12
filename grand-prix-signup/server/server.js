require("dotenv").config();
const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// --- Security Middleware ---
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

// Rate limiting to slow down brute-force attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: "Too many signup attempts, please try again later.",
});
app.use("/api/auth", authLimiter);

// --- Google Auth Verification Endpoint ---
app.post("/api/auth/google", async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res
      .status(400)
      .json({ success: false, error: "Missing credential" });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { name, email, picture } = payload;

    // TODO: Save this user to your database (MongoDB, Postgres, etc.)
    // Example: await User.create({ name, email, picture, role: 'beta_tester' });

    console.log(`✅ New beta signup: ${name} <${email}>`);

    res.json({
      success: true,
      user: { name, email, picture },
    });
  } catch (error) {
    console.error("❌ Token verification failed:", error.message);
    res.status(401).json({ success: false, error: "Invalid token" });
  }
});

// Simple health check
app.get("/", (req, res) => res.send("Grand Prix Team Principle API running."));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🏁 Server running on http://localhost:${PORT}`),
);
