const axios = require('axios');

module.exports.config = {
  name: "ip",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Hoàng NGỌC TỪ",
  description: "Tra cứu thông tin IP",
  usePrefix: true,
  commandCategory: "utilities",
  usages: "ip [địa chỉ IP]",
  cooldowns: 5,
  dependencies: {}
};

const apiKey = '77999b466a085d'; 

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;

  if (!args[0]) {
    return api.sendMessage("Vui lòng cung cấp địa chỉ IP để tra cứu thông tin. Ví dụ: ip 8.8.8.8", threadID, messageID);
  }

  const ipAddress = args[0];

  try {
    const response = await axios.get(`https://ipinfo.io/${ipAddress}/json?token=${apiKey}`);
    const ipInfo = response.data;

    const message = `Thông tin IP của bạn:\n🌐 IP: ${ipInfo.ip}\n📍 Địa chỉ: ${ipInfo.city}, ${ipInfo.region}, ${ipInfo.country}\n🌍 Khu vực: ${ipInfo.timezone}\n🔍 Nhà mạng: ${ipInfo.org}`;

    api.sendMessage(message, threadID, messageID);
  } catch (error) {
    console.error(error);
    api.sendMessage("Không thể tra cứu thông tin IP. Vui lòng kiểm tra địa chỉ IP hoặc thử lại sau.", threadID, messageID);
  }
};
