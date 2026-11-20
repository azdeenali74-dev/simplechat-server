const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

let messages = [];
let nextId = 1;

// اختبار السيرفر
app.get("/", (req, res) => {
    res.send("SimpleChat Server is Running!");
});

// إرسال رسالة
app.post("/send", (req, res) => {
    const { sender, receiver, message } = req.body;

    if (!sender || !receiver || !message) {
        return res.status(400).json({
            error: "Missing information"
        });
    }

    const newMessage = {
        id: nextId++,
        sender,
        receiver,
        message,
        time: new Date().toISOString()
    };

    messages.push(newMessage);

    res.json({
        success: true,
        message: newMessage
    });
});

// استقبال الرسائل
app.get("/messages", (req, res) => {
    const { user, with: other } = req.query;

    if (!user || !other) {
        return res.status(400).json({
            error: "Missing users"
        });
    }

    const conversation = messages.filter(m =>
        (m.sender === user && m.receiver === other) ||
        (m.sender === other && m.receiver === user)
    );

    res.json(conversation);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log("SimpleChat Server Running on port " + PORT);
});
