const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// تخزين مؤقت أثناء الاختبار
let messages = [];
let users = [];
let nextId = 1;

// الصفحة الرئيسية
app.get("/", (req, res) => {
    res.send("SimpleChat Server is Running!");
});

// توحيد صيغة رقم الهاتف اليمني
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

// تسجيل مستخدم جديد
app.post("/register", (req, res) => {
    const name = String(req.body.name || "").trim();
    const phone = normalizePhone(req.body.phone);

    if (!name) {
        return res.status(400).json({
            success: false,
            message: "اكتب اسم المستخدم"
        });
    }

    if (!phone) {
        return res.status(400).json({
            success: false,
            message: "رقم الهاتف اليمني غير صحيح"
        });
    }

    const existingUser = users.find(user => user.phone === phone);

    if (existingUser) {
        return res.status(409).json({
            success: false,
            message: "هذا الرقم مسجل مسبقاً"
        });
    }

    const user = {
        id: users.length + 1,
        name: name,
        phone: phone,
        createdAt: new Date().toISOString()
    };

    users.push(user);

    res.json({
        success: true,
        message: "تم تسجيل المستخدم",
        user: user
    });
});

// البحث عن مستخدم برقم الهاتف
app.get("/user", (req, res) => {
    const phone = normalizePhone(req.query.phone);

    if (!phone) {
        return res.status(400).json({
            success: false,
            message: "رقم الهاتف غير صحيح"
        });
    }

    const user = users.find(item => item.phone === phone);

    if (!user) {
        return res.status(404).json({
            success: false,
            found: false,
            message: "هذا الرقم غير مشترك في SimpleChat"
        });
    }

    res.json({
        success: true,
        found: true,
        user: user
    });
});

// إرسال رسالة - المسار القديم محفوظ
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
        sender: sender,
        receiver: receiver,
        message: message,
        time: new Date().toISOString()
    };

    messages.push(newMessage);

    res.json({
        success: true,
        message: newMessage
    });
});

// استقبال الرسائل - المسار القديم محفوظ
app.get("/messages", (req, res) => {
    const user = String(req.query.user || "");
    const friend = String(req.query.with || "");

    const conversation = messages.filter(item =>
        (item.sender === user && item.receiver === friend) ||
        (item.sender === friend && item.receiver === user)
    );

    res.json(conversation);
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("SimpleChat Server running on port " + PORT);
});
