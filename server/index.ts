import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
const PORT = 4000;

app.use(cors()); // cho ph?p truy c?p t? client

app.get("/api/questions", async (req, res) => {
  const repo = "your-username/your-private-repo";
  const path = "questions.json";
  const url = `https://api.github.com/repos/${repo}/contents/${path}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3.raw"
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch file" });
    }

    const json = await response.json();
    res.json(json);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
