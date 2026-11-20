const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

let users = [];
let messages = [];
let nextId = 1;

// توحيد صيغة رقم الهاتف اليمني
function normalizePhone(phone) {
    if (!phone) return "";

    let p = String(phone).replace(/\s+/g, "");

    if (p.startsWith("00967")) {
        p = "+" + p.substring(2);
    } else if (p.startsWith("967")) {
        p = "+" + p;
    } else if (p.startsWith("07")) {
        p = "+967" + p.substring(1);
    } else if (p.startsWith("7")) {
        p = "+967" + p;
    }

    return p;
}

// الصفحة الرئيسية
app.get("/", (req, res) => {
    res.send("SimpleChat Server is Running");
});

// تسجيل مستخدم جديد
app.post("/register", (req, res) => {
    const username = String(req.body.username || "").trim();
    const phone = normalizePhone(req.body.phone);

    if (!username || !phone) {
        return res.status(400).json({
            success: false,
            message: "الاسم ورقم الهاتف مطلوبان"
        });
    }

    const existingPhone = users.find(
        user => user.phone === phone
    );

    if (existingPhone) {
        return res.json({
            success: true,
            message: "الحساب مسجل مسبقاً",
            user: existingPhone
        });
    }

    const existingUsername = users.find(
        user => user.username === username
    );

    if (existingUsername) {
        return res.status(409).json({
            success: false,
            message: "اسم المستخدم مستخدم بالفعل"
        });
    }

    const newUser = {
        username: username,
        phone: phone
    };

    users.push(newUser);

    return res.json({
        success: true,
        message: "تم التسجيل بنجاح",
        user: newUser
    });
});

// البحث عن مستخدم بواسطة رقم الهاتف
app.get("/user", (req, res) => {
    const phone = normalizePhone(req.query.phone);

    if (!phone) {
        return res.status(400).json({
            success: false,
            message: "رقم الهاتف مطلوب"
        });
    }

    const user = users.find(
        item => item.phone === phone
    );

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "المستخدم غير موجود"
        });
    }

    return res.json({
        success: true,
        user: user
    });
});

// إرسال رسالة
app.post("/send", (req, res) => {
    const sender = String(req.body.sender || "").trim();
    const receiver = String(req.body.receiver || "").trim();
    const message = String(req.body.message || "").trim();

    if (!sender  !receiver  !message) {
        return res.status(400).json({
            success: false,
            message: "بيانات الرسالة غير مكتملة"
        });
    }

    const senderUser = users.find(
        user => user.username === sender
    );

    const receiverUser = users.find(
        user => user.username === receiver
    );

    if (!senderUser) {
        return res.status(404).json({
            success: false,
            message: "المرسل غير موجود"
        });
    }

    if (!receiverUser) {
        return res.status(404).json({
            success: false,
            message: "المستلم غير موجود"
        });
    }

    const newMessage = {
        id: nextId++,
        sender: sender,
        receiver: receiver,
        senderPhone: senderUser.phone,
        message: message,
        time: new Date().toISOString()
    };

    messages.push(newMessage);

    return res.json({
        success: true,
        message: "تم إرسال الرسالة",
        data: newMessage
    });
});

// جلب الرسائل بين مستخدمين
app.get("/messages", (req, res) => {
    const user = String(req.query.user || "").trim();
    const withUser = String(req.query.with || "").trim();

    if (!user || !withUser) {
        return res.status(400).json({
            success: false,
            message: "بيانات المحادثة غير مكتملة"
        });
    }
