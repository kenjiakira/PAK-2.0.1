module.exports.config = {
  name: "rizz",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Hoàng Ngọc Từ",
  description: "câu nói hoặc câu thơ về tán tỉnh",
  commandCategory: "Giải Trí",
  usePrefix: true,
  usages: "Sử dụng: .rizz",
  cooldowns: 5
};

const pickupLines = [
  "Nếu anh là giọt nước mắt em, thì em sẽ không bao giờ khóc vì sợ mất anh.",
  "Em có tên chưa? Để anh còn biết gọi em bằng gì khi gặp giấc mơ.",
  "Trái đất này rộng lớn như vậy, mà sao em chỉ muốn thấy mỗi mình anh.",
  "Anh có phải là Google không? Vì anh có mọi thứ em đang tìm kiếm.",
  "Nếu yêu em là sai, thì anh không bao giờ muốn đúng.",
  "Anh biết tại sao mặt trời mọc mỗi ngày không? Vì anh luôn muốn thấy nụ cười của em.",
  "Em có một bản đồ không? Anh cứ bị lạc trong đôi mắt của em.",
  "Nếu mỗi lần nghĩ về em anh được một ngôi sao, thì bầu trời này đã sáng rực.",
  "Anh có biết điều gì đặc biệt về đôi mắt của anh không? Nó phản chiếu hình ảnh của em.",
  "Nếu yêu em là một tội lỗi, thì anh sẵn lòng chịu phạt.",
  "Em có biết không, mỗi khi em cười là trái tim anh tan chảy.",
  "Anh không giỏi toán, nhưng anh biết rằng mình và em là một cặp hoàn hảo.",
  "Nếu yêu em là một tội lỗi, anh chấp nhận bị trừng phạt suốt đời.",
  "Em là lý do anh tin vào tình yêu từ cái nhìn đầu tiên.",
  "Mỗi lần nhìn vào mắt em, anh thấy cả một vũ trụ.",
  "Em có bản đồ không? Anh cứ bị lạc trong ánh mắt của em.",
  "Em làm gì mà đẹp quá vậy, anh cứ ngỡ em là thiên thần.",
  "Anh có thể mượn điện thoại của em không? Anh muốn gọi cho mẹ anh và nói rằng anh vừa gặp thiên thần.",
  "Nếu anh là một giọt nước mắt, anh muốn sinh ra trong mắt em, trôi trên má em và chết trên môi em.",
  "Em có thấy mệt không? Vì em cứ chạy trong tâm trí anh suốt ngày.",
  "Anh muốn làm người yêu của em, không chỉ bây giờ mà mãi mãi.",
  "Nếu có một điều ước, anh ước rằng chúng ta sẽ ở bên nhau mãi mãi.",
  "Trái tim anh có bốn ngăn: một ngăn yêu em, một ngăn thương em, một ngăn nhớ em và một ngăn dành cho em.",
  "Em là người đặc biệt nhất trong cuộc đời anh, không ai có thể thay thế em.",
  "Mỗi khi nghĩ về em, anh lại thấy yêu cuộc sống này hơn.",
  "Anh muốn là người cuối cùng mà em nghĩ đến trước khi ngủ và người đầu tiên mà em nhớ đến khi tỉnh dậy.",
  "Em có tin vào tình yêu từ cái nhìn đầu tiên không, hay anh phải đi qua lại trước mặt em một lần nữa?",
  "Anh không phải là người hoàn hảo, nhưng anh sẽ làm mọi thứ để em cảm thấy hạnh phúc.",
  "Em là món quà quý giá nhất mà cuộc đời đã ban tặng cho anh.",
  "Khi em xuất hiện, mọi thứ khác trở nên mờ nhạt.",
  "Anh muốn cùng em đi đến mọi nơi trên thế giới này.",
  "Em có biết không, mỗi khi em cười, anh lại cảm thấy thế giới này tươi đẹp hơn rất nhiều.",
  "Nếu anh được chọn một người để đi cùng suốt cuộc đời, người đó sẽ là em.",
  "Anh không thể hứa sẽ giải quyết mọi vấn đề của em, nhưng anh hứa sẽ luôn bên em."

];

let lastPickupLine = "";

module.exports.run = async ({ api, event }) => {
  const { threadID } = event;
  let randomPickupLine;

  do {
    randomPickupLine = pickupLines[Math.floor(Math.random() * pickupLines.length)];
  } while (randomPickupLine === lastPickupLine);

  lastPickupLine = randomPickupLine;

  return api.sendMessage(randomPickupLine, threadID);
};
