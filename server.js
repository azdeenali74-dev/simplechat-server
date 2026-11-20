return {
                id: item.id,
                sender: item.sender,
                senderPhone: senderUser
                    ? senderUser.phone
                    : "",
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

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(
        "SimpleChat Server running on port " + PORT
    );
});
