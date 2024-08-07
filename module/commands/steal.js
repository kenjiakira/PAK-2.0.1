const cooldown = new Map();

module.exports.config = {
  name: "steal",
  version: "1.0.0",
  hasPermission: 2,
  credits: "HNT",
  description: "Trộm tiền ai đó",
  commandCategory: "Tài chính",
  usePrefix: true,
  usages: "steal [@mention] | steal bail",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args, Currencies }) => {
  const { senderID, threadID, messageID, mentions } = event;
  const mentionID = Object.keys(mentions)[0];
  const command = args[0];


  if (command === "bail") {
    const bailAmount = 300;
    const userBalance = (await Currencies.getData(senderID)).money;

    if (userBalance < bailAmount) {
      return api.sendMessage("Bạn không đủ xu để được bảo lãnh. Bạn cần 300 xu.", threadID, messageID);
    }


    await Currencies.decreaseMoney(senderID, bailAmount);
    api.sendMessage("Bạn đã bảo lãnh thành công. Bạn có thể tiếp tục trộm tiền.", threadID, messageID);
    cooldown.delete(senderID); 

    return;
  }

  if (!mentionID) return api.sendMessage("Bạn phải tag người dùng để trộm tiền.", threadID, messageID);

  const currentTime = Date.now();
  const lastUsed = cooldown.get(senderID) || 0;

  const cooldownFailure = 24 * 60 * 60 * 1000;

  const success = Math.random() < 0.5;
  const amount = Math.floor(Math.random() * 100) + 1;

  const senderData = await Currencies.getData(senderID);
  const senderName = senderData.name || `User ${senderID}`;

  if (success) {
    const targetData = await Currencies.getData(mentionID);
    const targetBalance = targetData.money;
    const targetName = mentions[mentionID].replace("@", "");
    if (targetBalance < amount) return api.sendMessage("Người dùng này không có đủ tiền để bạn trộm.", threadID, messageID);

    await Currencies.decreaseMoney(mentionID, amount);
    await Currencies.increaseMoney(senderID, amount);

    api.sendMessage(`Cảnh báo: Bạn đã bị ${senderName} trộm ${amount} xu.`, mentionID);

    api.sendMessage(`Bạn đã trộm thành công ${amount} xu từ ${targetName}.`, threadID, messageID);
    cooldown.set(senderID, currentTime); 

  } else {
    const penalty = 100; 
    await Currencies.decreaseMoney(senderID, penalty);

    const targetName = mentions[mentionID].replace("@", "");
    api.sendMessage(`Cảnh báo: ${senderName} đã cố gắng trộm tiền từ bạn nhưng thất bại và bị phạt ${penalty} xu.`, mentionID);

    api.sendMessage(`Bạn đã bị cảnh sát bắt và bị phạt ${penalty} xu. Bạn bị giam 24 giờ và không thể thực hiện hành động trộm tiền trong thời gian này. Sử dụng lệnh "steal bail" để được bảo lãnh.`, threadID, messageID);
    cooldown.set(senderID, currentTime + cooldownFailure); 
  }
};
