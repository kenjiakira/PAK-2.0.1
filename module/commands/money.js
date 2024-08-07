const fs = require("fs");
const { createCanvas, loadImage } = require('canvas');
const path = require('path');

module.exports.config = {
  name: "money",
  version: "1.1.1",
  hasPermission: 0,
  credits: "Mirai Team Mod By Hoàng Ngọc Từ",
  description: "Kiểm tra số tiền của bản thân hoặc người được tag",
  commandCategory: "Tài Chính",
  usePrefix: true,
  usages: "gõ .money để xem xu của mình hoặc của người khác bằng cách tag\nVD: bạn cần xem tiền của người tên A\ngõ [.money @A] hoặc trả lời tin nhắn của người đó",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args, Currencies }) {
  const { threadID, messageID, senderID, mentions, messageReply } = event;

  let userID;

  // Nếu có tin nhắn trả lời, lấy ID người dùng từ tin nhắn đó
  if (messageReply && messageReply.senderID) {
    userID = messageReply.senderID;
  } else if (args[0]) {
    userID = Object.keys(mentions)[0];
  } else {
    userID = senderID;
  }

  try {
    const userData = await Currencies.getData(userID);
    const balance = userData && userData.money ? userData.money : 0;
    const formattedBalance = formatNumber(balance);
    const userName = await getUserName(api, userID);

    const imagePath = await createBalanceImage(userName, formattedBalance);

    return api.sendMessage({
      attachment: fs.createReadStream(imagePath)
    }, threadID, () => fs.unlinkSync(imagePath), messageID);
  } catch (error) {
    console.error(error);
    return api.sendMessage("Đã xảy ra lỗi khi kiểm tra số tiền.", threadID, messageID);
  }
};

function formatNumber(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

async function getUserName(api, userID) {
  try {
    const userInfo = await api.getUserInfo(userID);
    return userInfo[userID].name;
  } catch (error) {
    console.error(error);
    return "người dùng";
  }
}

async function createBalanceImage(userName, balance) {
  const width = 800;
  const height = 200;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const backgroundImagePath = path.join(__dirname, 'images', 'background.png'); 

  try {
    const background = await loadImage(backgroundImagePath);

    ctx.drawImage(background, 0, 0, width, height);

    ctx.font = "bold 40px Times New Roman";
    ctx.fillStyle = "#000000";
    ctx.fillText(`${userName}`, 50, 80);
    const nameTextY = height / 2 - 30;
    ctx.font = "bold 50px Times New Roman";
    ctx.fillStyle = "#ff0000";
    ctx.fillText(`${balance} xu`, 50, 150);

    const imagePath = path.join(__dirname, 'balance_image.png');
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(imagePath, buffer);

    return imagePath;
  } catch (error) {
    console.error('Lỗi khi tải hoặc xử lý hình ảnh:', error);
    throw new Error('Lỗi khi tạo hình ảnh');
  }
}
