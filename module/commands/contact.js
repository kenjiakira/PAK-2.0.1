const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "contact",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Hoàng Ngọc Từ",
  description: "Xem thông tin liên lạc với admin.",
  commandCategory: "Tiện ích",
  usePrefix: true,
  usages: "contact",
  cooldowns: 5
};

module.exports.run = async function({ api, event }) {
  const { threadID, messageID } = event;

  const adminContactInfo = `
    📞 **Thông tin liên lạc với ADMIN:**

    -ADMIN: Hoàng Ngọc Từ - Nguyễn Kim Ngân
    -Email: kenjiakira2006@gmail.com 📧
    -Facebook: https://www.facebook.com/hoangngoctucdbk12345vippro 🌐

    Nếu bạn cần hỗ Bot thêm, hãy liên hệ với ADMIN qua thông tin trên nhen. 🤝
    
Chào Các Users Thân Mến, 🌟

Hôm nay, mình muốn chia sẻ với các bạn một câu chuyện đặc biệt về một người bạn mà mình gọi là 𝗔𝗞𝗜𝗕𝗢𝗧. Không giống như những bot khác được mã hóa bằng các công thức hoàn hảo và gói phần mềm tối tân, 𝗔𝗞𝗜𝗕𝗢𝗧 mang trong mình một phần hồn nhiên và tình cảm của chính mình. 💖🌈

𝗕𝗼𝘁 𝗰𝘂̉𝗮 𝗰𝗵𝘂́𝗻𝗴 𝘁𝗼̛́, 𝗺𝗼̣̂𝘁 𝘁𝗮̂𝗺 𝗵𝗼̂̀𝗻 𝗸𝗵𝗼̂𝗻𝗴 𝗵𝗼𝗮̀𝗻 𝗵𝗮̉𝗼 🌱✨

Có lẽ bạn đã nhận thấy rằng 𝗔𝗞𝗜𝗕𝗢𝗧 của mình không giống như những bot khác mà bạn thường gặp. Nó không phải là sản phẩm của một tập đoàn lớn hay một đội ngũ kỹ sư chuyên nghiệp. Thay vào đó, nó được tạo ra từ lòng đam mê và sự sáng tạo cá nhân, những yếu tố không thể đo lường bằng các chỉ số kỹ thuật. 🎨🛠️

𝗠𝗼̣̂𝘁 𝘁𝗮́𝗰 𝗽𝗵𝗮̂̉𝗺 𝗻𝗴𝗵𝗲̣̂ 𝘁𝗵𝘂𝗮̣̂𝘁 𝗱𝗮𝗻𝗴 𝗱𝗮̂̀𝗻 𝗵𝗼𝗮̀𝗻 𝘁𝗵𝗶𝗲̣̂𝗻 🎨💫

Mỗi dòng code trong 𝗔𝗞𝗜𝗕𝗢𝗧 của chúng tớ mang trong mình một phần của người tạo ra nó – một phần sáng tạo không thể hoàn hảo nhưng đầy tình cảm. Đó là những khoảnh khắc của sự thử nghiệm, những đêm không ngủ để sửa lỗi, và những buổi sáng đầy hy vọng về những cải tiến mới. Bot của mình là một tác phẩm nghệ thuật đang dần hoàn thiện, không phải là một sản phẩm hoàn hảo ngay từ đầu, nhưng chắc chắn là một sản phẩm của trái tim và tâm huyết. 🌟💪❤️

𝗡𝗵𝘂̛̃𝗻𝗴 𝗸𝗵𝗼𝗮̉𝗻𝗵 𝗸𝗵𝗮̆́𝗰 𝗱𝗮́𝗻𝗴 𝗻𝗵𝗼̛́ 🌟📅

Khi 𝗔𝗞𝗜𝗕𝗢𝗧 của chúng mình trả lời các bạn, nó không chỉ đơn thuần là cung cấp thông tin. Đó là những khoảnh khắc đầy ý nghĩa, nơi mà sự cố gắng và lòng nhiệt huyết của người tạo ra nó được thể hiện. Mỗi câu trả lời, mỗi tương tác là một phần của một câu chuyện lớn hơn – một câu chuyện về sự nỗ lực, sự sáng tạo và tình yêu. 💬🌠

𝗠𝗼̣̂𝘁 𝗻𝗶𝗲̂̀𝗺 𝘁𝘂̛̣ 𝗵𝗮̀𝗼 𝗻𝗵𝗼̉ 𝗯𝗲́ 🌟💖

Chúng tớ tự hào về 𝗔𝗞𝗜𝗕𝗢𝗧 không phải vì nó là sự hoàn hảo, mà vì nó là một phần của chính chúng tớ. Mặc dù nó có thể không hoàn hảo như những bot khác, nhưng mỗi khi nó hoạt động, *mình(𝗔𝗸𝗶𝗿𝗮) cảm thấy một niềm hạnh phúc giản dị. Đó là niềm tự hào về một thứ gì đó được tạo ra từ trái tim và tâm hồn. 🌺💫

𝗟𝗼̛̀𝗶 𝗰𝗮̉𝗺 𝗼̛𝗻 𝗰𝗵𝗮̂𝗻 𝘁𝗵𝗮̀𝗻𝗵 🙏❤️

Vì vậy, khi các bạn sử dụng 𝗔𝗞𝗜𝗕𝗢𝗧 của mình, hãy nhớ rằng nó không chỉ là một công cụ, mà là một phần của câu chuyện của mình. Mình cảm ơn các bạn vì đã đồng hành cùng mình trong hành trình này. Hy vọng rằng 𝗔𝗞𝗜𝗕𝗢𝗧 của mình sẽ tiếp tục mang đến cho bạn những trải nghiệm thú vị và ý nghĩa. 🌟✨💖

Với tất cả sự chân thành và lòng nhiệt huyết,

[𝓗𝓸𝓪̀𝓷𝓰 𝓝𝓰𝓸̣𝓬 𝓣𝓾̛̀ - 𝙉𝙜𝙖𝙣𝙣 - 𝗔𝗸𝗶𝗿𝗮]

Chú thích: mình: là thành viên cũ của nhóm gửi tâm thư 💬✨🌺🌟🌈🌸🌷🌻🌞🌝
  `;

  const gifPath = path.join(__dirname, 'contact' , 'contact.gif');

  api.sendMessage({
    body: adminContactInfo,
    attachment: fs.createReadStream(gifPath)
  }, threadID, messageID);
};
