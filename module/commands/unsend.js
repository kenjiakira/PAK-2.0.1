module.exports.config = {
  name: "unsend",
  version: "1.1.0",
  hasPermission: 0,
  credits: "Akira",
  description: "Gỡ tin nhắn của Bot",
  usePrefix: true,
  commandCategory: "message",
  usages: "Gỡ tin nhắn bằng cách reply tin nhắn cần gỡ với lệnh Unsend",
  cooldowns: 0
};

module.exports.run = function({ api, event }) {
  if (event.type !== "message_reply") {
    return api.sendMessage("⚠️ Hãy reply tin nhắn cần gỡ.", event.threadID, event.messageID);
  }
  
  if (event.messageReply.senderID !== api.getCurrentUserID() && event.messageReply.senderID !== event.senderID) {
    return api.sendMessage("⚠️ Bạn không thể gỡ tin nhắn của người khác.", event.threadID, event.messageID);
  }

  return api.unsendMessage(event.messageReply.messageID);
}
