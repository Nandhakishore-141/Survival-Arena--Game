const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

let highScore = 0;

// Get high score
app.get("/highscore", (req, res) => {
    res.json({ highScore });
});

// Save high score
app.post("/highscore", (req, res) => {
    const { score } = req.body;
    if (score > highScore) {
        highScore = score;
    }
    res.json({ highScore });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});