const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

let messages = [];
let users = [];
let nextId = 1;

app.get("/", (req, res) => {
    res.send("SimpleChat Server is Running!");
});

function normalizePhone(phone) {
    let value = String(phone || "").replace(/[\s-]/g, "");

    if (value.startsWith("00967")) {
        value = "+967" + value.substring(5);
    } else if (value.startsWith("967")) {
        value = "+" + value;
    } else if (value.startsWith("07")) {
        value = "+967" + value.substring(1);
    } else if (value.startsWith("7")) {
        value = "+967" + value;
    }

    if (!/^\+9677\d{8}$/.test(value)) {
        return null;
    }

    return value;
}

app.post("/register", (req, res) => {
    const name = String(req.body.name || "").trim();
    const phone = normalizePhone(req.body.phone);

    if (!name || !phone) {
        return res.status(400).json({
            success: false,
            message: "بيانات التسجيل غير صحيحة"
        });
    }

    const existing = users.find(u => u.phone === phone);

    if (existing) {
        return res.status(409).json({
            success: false,
            message: "هذا الرقم مسجل مسبقاً"
        });
    }

    const user = {
        id: users.length + 1,
        name,
        phone,
        createdAt: new Date().toISOString()
    };

    users.push(user);

    res.json({
        success: true,
        message: "تم تسجيل المستخدم",
        user
    });
});

app.get("/user", (req, res) => {
    const phone = normalizePhone(req.query.phone);

    if (!phone) {
        return res.status(400).json({
            success: false,
            message: "رقم الهاتف غير صحيح"
        });
    }

    const user = users.find(u => u.phone === phone);

    if (!user) {
        return res.status(404).json({
            success: true,
            found: false,
            message: "المستخدم غير موجود"
        });
    }

    res.json({
        success: true,
        found: true,
        user
    });
});

app.post("/send", (req, res) => {
    const sender = String(req.body.sender || "").trim();
    const receiver = String(req.body.receiver || "").trim();
    const message = String(req.body.message || "").trim();

    if (!sender  !receiver  !message) {
        return res.status(400).json({
            success: false,
            message: "بيانات الرسالة ناقصة"
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

app.get("/messages", (req, res) => {
    const user = String(req.query.user || "");
    const friend = String(req.query.with || "");

    const conversation = messages.filter(item =>
        (item.sender === user && item.receiver === friend) ||
        (item.sender === friend && item.receiver === user)
    );

    res.json(conversation);
});

app.get("/inbox", (req, res) => {
    const userName = String(req.query.user || "").trim();

    if (!userName) {
        return res.status(400).json({
            success: false,
            message: "اسم المستخدم مطلوب"
        });
    }

    const inbox = messages
        .filter(item => item.receiver === userName)
        .map(item => {
            const senderUser = users.find(
                u => u.name === item.sender
            );

            return {
                id: item.id,
                sender: item.sender,
                senderPhone: senderUser ? senderUser.phone : "",
                receiver: item.receiver,
                message: item.message,
                time: item.time
            };
        });

    res.json({
        success: true,
        messages: inbox
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("SimpleChat Server running on port " + PORT);
});
