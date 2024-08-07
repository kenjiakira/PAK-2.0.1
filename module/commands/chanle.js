const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports.config = {
    name: "chanle",
    version: "1.1.4",
    hasPermission: 2,
    credits: "Hoàng Ngọc Từ",
    description: "Chơi chẵn lẻ",
    commandCategory: "Giải trí",
    usePrefix: true,
    usages: "[chẵn | lẻ] [số xu]",
    cooldowns: 5,
    update: true,
};

module.exports.run = async ({ api, event, args, Currencies, Users }) => {
    const { threadID, messageID, senderID } = event;
    const lastGameTime = global.lastGameTime || 0;
    const currentTime = Date.now();
    if (currentTime - lastGameTime < 30000) { 
        const remainingTime = Math.ceil((30000 - (currentTime - lastGameTime)) / 1000);
        return api.sendMessage(`Vui lòng đợi ${remainingTime} giây trước khi chơi lại.`, threadID, messageID);
    }
    global.lastGameTime = currentTime;

    const generateResult = () => {
        const colors = ["⚪", "🔴"];
        const coins = [];

        const isSuperRare = Math.random() < 1 / 50; 
        if (isSuperRare) {
            const rareColor = colors[Math.floor(Math.random() * colors.length)];
            coins.push(rareColor, rareColor, rareColor, rareColor);
        } else {
            for (let i = 0; i < 4; i++) {
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                coins.push(randomColor);
            }
        }
        return coins;
    };

    const checkResult = (coins) => {
        const whiteCount = coins.filter(coin => coin === "⚪").length;
        const redCount = coins.filter(coin => coin === "🔴").length;

        let result = "chẵn";
        if (whiteCount === 1 || redCount === 1 || whiteCount === 3 || redCount === 3) {
            result = "lẻ";
        }

        return { result, whiteCount, redCount };
    };

    if (args.length < 2) {
        return api.sendMessage("Bạn phải đặt cược theo cú pháp: [chẵn | lẻ] [số xu]. Ví dụ: !chanle chẵn 100", threadID, messageID);
    }

    const betType = args[0].toLowerCase();
    const betAmount = parseInt(args[1]);

    if (!["chẵn", "lẻ"].includes(betType)) {
        return api.sendMessage("Bạn phải đặt cược vào 'chẵn' hoặc 'lẻ'. Ví dụ: !chanle chẵn 100", threadID, messageID);
    }

    if (isNaN(betAmount) || betAmount <= 0) {
        return api.sendMessage("Bạn phải đặt cược một số xu hợp lệ. Ví dụ: !chanle chẵn 100", threadID, messageID);
    }

    const maxBetAmount = 500;
    if (betAmount > maxBetAmount) {
        return api.sendMessage(`Số tiền cược không được vượt quá ${maxBetAmount} xu.`, threadID, messageID);
    }

    const userBalance = (await Currencies.getData(senderID)).money;
    if (userBalance < betAmount) {
        return api.sendMessage("Bạn không đủ xu để đặt cược.", threadID, messageID);
    }

    const coins = generateResult();
    const { result, whiteCount, redCount } = checkResult(coins);

    let response = `Kết quả:\n`;
    let win = false;
    let winAmount = 0;

    if ((whiteCount === 4 || redCount === 4) && betType === "chẵn") {
        winAmount = betAmount * 6; 
        win = true;
    } else if ((whiteCount === 4 || redCount === 4) && betType === "lẻ") {
        winAmount = 0; 
    } else if (betType === "chẵn" && result === "chẵn") {
        win = true;
        winAmount = betAmount * 2;
    } else if (betType === "lẻ" && result === "lẻ") {
        win = true;
        winAmount = betAmount * 2;
    }
    
    const userData = await Users.getData(senderID);
    const userName = userData.name;

    if (win) {
        response += `${userName} đã thắng ${winAmount} xu!`;
        await Currencies.increaseMoney(senderID, winAmount);
    } else {
        response += `${userName} đã thua ${betAmount} xu.`;
        await Currencies.decreaseMoney(senderID, betAmount);
    }

    const userNewBalance = (await Currencies.getData(senderID)).money;
    response += `\nSố dư hiện tại của bạn là ${userNewBalance} xu.`;

    const canvas = createCanvas(1280, 1280);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const imageUrls = {
        "4 đỏ": "https://i.imgur.com/xzZuR0z.jpeg",
        "4 trắng": "https://i.imgur.com/U7LSj5X.jpeg",
        "3 đỏ 1 trắng": "https://i.imgur.com/nNmoy4j.jpeg",
        "3 trắng 1 đỏ": "https://i.imgur.com/WzEozyZ.jpeg",
        "2 đỏ 2 trắng": "https://i.imgur.com/wBhq6GK.jpeg"
    };

    const resultImageUrl = imageUrls[`${redCount} đỏ ${whiteCount} trắng`];
    if (resultImageUrl) {
        try {
            const { data } = await axios.get(resultImageUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(data, 'binary');
            const image = await loadImage(buffer);
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        } catch (error) {
            console.error("Lỗi khi tải hoặc vẽ ảnh từ Imgur:", error);
        }
    } else {
        console.error("Không tìm thấy ảnh cho kết quả:", `${redCount} đỏ ${whiteCount} trắng`);
    }

    const outputFilePath = path.join(__dirname, 'tmp', `result_${senderID}.png`);
    const out = fs.createWriteStream(outputFilePath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);

    out.on('finish', () => {
        api.sendMessage({
            body: response,
            attachment: fs.createReadStream(outputFilePath)
        }, threadID, messageID);
    });
};
