const fs = require('fs');
const path = require('path');

module.exports.config = {
    name: "xin",
    version: "1.0.0",
    hasPermission: 2,
    credits: "Hoàng Ngọc Từ",
    description: "Lệnh ăn xin để kiếm tiền",
    commandCategory: "Kiếm Tiền",
    usePrefix: true,
    cooldowns: 1,
    update: true
};

module.exports.run = async ({ event, api, Currencies }) => {
    const { senderID, threadID } = event;

    try {
        // Tạo số tiền ngẫu nhiên từ 50 đến 200 xu
        const minAmount = 50;
        const maxAmount = 200;
        const amount = Math.floor(Math.random() * (maxAmount - minAmount + 1)) + minAmount;

        // Cộng số tiền vào tài khoản người dùng
        await Currencies.increaseMoney(senderID, amount);

        // Gửi thông báo cho người dùng
        api.sendMessage(`Bạn đã nhận được ${amount} xu từ lệnh ăn xin! Chúc bạn may mắn! 💸`, threadID);
    } catch (error) {
        console.error("Lỗi trong quá trình thực hiện lệnh ăn xin:", error);
        api.sendMessage("Đã xảy ra lỗi trong quá trình thực hiện lệnh ăn xin. Vui lòng thử lại sau.", threadID);
    }
};
