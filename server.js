const conversation = messages.filter(msg => {
        return (
            (msg.sender === user && msg.receiver === withUser) ||
            (msg.sender === withUser && msg.receiver === user)
        );
    });

    return res.json({
        success: true,
        messages: conversation
    });
});

// جلب جميع الرسائل الواردة للمستخدم
app.get("/inbox", (req, res) => {
    const username = String(req.query.user || "").trim();

    if (!username) {
        return res.status(400).json({
            success: false,
            message: "اسم المستخدم مطلوب"
        });
    }

    const inbox = messages
        .filter(msg => msg.receiver === username)
        .map(msg => {
            const senderUser = users.find(
                user => user.username === msg.sender
            );

            return {
                ...msg,
                senderPhone: senderUser
                    ? senderUser.phone
                    : (msg.senderPhone || "")
            };
        });

    return res.json({
        success: true,
        messages: inbox
    });
});

// تشغيل السيرفر
app.listen(PORT, () => {
    console.log("SimpleChat Server running on port " + PORT);
});
