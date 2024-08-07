const fs = require('fs');
const path = require('path');
const moment = require('moment');

const investmentOpportunitiesPath = path.join(__dirname, '../../module/commands/json/investmentOpportunities.json');
const userInvestmentsPath = path.join(__dirname, '../../module/commands/json/userInvestments.json');

function readInvestmentOpportunities() {
  try {
    const rawData = fs.readFileSync(investmentOpportunitiesPath);
    return JSON.parse(rawData);
  } catch (error) {
    console.error(`Lỗi khi đọc dữ liệu cơ hội đầu tư từ ${investmentOpportunitiesPath}:`, error);
    return [];
  }
}

function updateInvestmentOpportunities(newOpportunities) {
  try {
    fs.writeFileSync(investmentOpportunitiesPath, JSON.stringify(newOpportunities, null, 2), 'utf8');
  } catch (error) {
    console.error("Lỗi khi cập nhật dữ liệu cơ hội đầu tư:", error);
  }
}

function readUserInvestments() {
  try {
    const rawData = fs.readFileSync(userInvestmentsPath);
    return JSON.parse(rawData);
  } catch (error) {
    console.error(`Lỗi khi đọc dữ liệu đầu tư người dùng từ ${userInvestmentsPath}:`, error);
    return {};
  }
}

function updateUserInvestments(data) {
  try {
    fs.writeFileSync(userInvestmentsPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error("Lỗi khi cập nhật dữ liệu đầu tư người dùng:", error);
  }
}

function findOpportunityByAbbreviation(abbreviation) {
  const investmentOpportunities = readInvestmentOpportunities();
  return investmentOpportunities.find(op => op.name.toLowerCase() === abbreviation.toLowerCase());
}

function findOpportunityByFullName(fullName) {
  const investmentOpportunities = readInvestmentOpportunities();
  return investmentOpportunities.find(op => op.fullName.toLowerCase() === fullName.toLowerCase());
}

module.exports.config = {
  name: "trader",
  version: "1.8.0",
  hasPermission: 0,
  credits: "Hoàng Ngọc Từ",
  description: "Đầu tư cổ phiếu kiếm xu",
  commandCategory: "Finance",
  usePrefix: true,
  usages: `
    .trader [viết tắt] [số tiền] | .trader stats
    - Đầu tư vào cổ phiếu theo viết tắt và số tiền. Ví dụ: .trader CPCN 1000

    Hướng dẫn:
    - Viết tắt phải có trong danh sách cơ hội đầu tư.
    - Số tiền phải là số dương và bạn phải có đủ tiền để đầu tư.
    - Nếu bạn đầu tư vào cơ hội có rủi ro dưới 50%, bạn chỉ có thể đầu tư tối đa 3 lần mỗi giờ.
    - Bạn cần đợi ít nhất 2 phút giữa các lần đầu tư.

    .trader stats
    - Hiển thị thống kê đầu tư của bạn, bao gồm tổng lợi nhuận và rủi ro trung bình.
  `,
  cooldowns: 0
};

module.exports.run = async ({ event, api, Currencies }) => {
  const { senderID, threadID } = event;
  const args = event.body.trim().split(' ');

  if (args.length === 1 && args[0].toLowerCase() === '.trader') {
    const investmentOpportunities = readInvestmentOpportunities();
    const list = investmentOpportunities.map(op => 
      `- ${op.name}: ${op.fullName}\nRủi ro ${op.risk * 100}%\nLợi nhuận ${op.return}x`
    ).join('\n\n');

    const usageInstructions = `📋 Danh sách cơ hội đầu tư:\n\n${list}\n\n` +
      "Hướng dẫn sử dụng:\n" +
      ".trader [viết tắt] [số tiền]\n" +
      "Ví dụ: .trader CPCN 1000\n" +
      "Viết tắt phải có trong danh sách trên và số tiền phải là số dương.";

    return api.sendMessage(usageInstructions, threadID);
  }

  if (args.length === 2 && args[1].toLowerCase() === 'stats') {
    const investments = [
      { name: "CPCN", fullName: "Cổ Phiếu Công Nghệ", amount: 1000, outcome: 'lợi nhuận', return: 3, risk: 0.7 },
      { name: "BDS", fullName: "Bất Động Sản", amount: 500, outcome: 'thua lỗ', return: 2, risk: 0.5 }
    ];
    const totalProfit = calculateTotalProfit(investments);
    const avgRisk = analyzeRisk(investments);

    const statsMessage = `📊 Thống kê đầu tư của bạn:\n` +
      `- Tổng lợi nhuận: ${totalProfit} xu\n` +
      `- Rủi ro trung bình: ${avgRisk * 100}%`;

    return api.sendMessage(statsMessage, threadID);
  }

  if (args.length < 3) {
    return api.sendMessage("Vui lòng sử dụng đúng cú pháp: .trader [viết tắt] [số tiền]", threadID);
  }

  const investmentTypeInput = args[1].toUpperCase();
  const amount = parseInt(args[2]);

  if (isNaN(amount) || amount <= 0) {
    return api.sendMessage("Số tiền không hợp lệ. Vui lòng nhập số tiền dương.", threadID);
  }

  const data = await Currencies.getData(senderID);
  const currentMoney = data.money || 0;

  if (currentMoney < amount) {
    return api.sendMessage(`Bạn không đủ tiền để đầu tư.\n` +
      `- Số tiền hiện tại: ${currentMoney} xu\n` +
      `- Số tiền cần để đầu tư: ${amount} xu`, threadID);
  }

  const opportunity = findOpportunityByAbbreviation(investmentTypeInput);

  if (!opportunity) {
    const investmentOpportunities = readInvestmentOpportunities();
    const suggestedTypes = investmentOpportunities
      .map(op => op.name)
      .filter(name => name.toLowerCase().includes(investmentTypeInput.toLowerCase()))
      .join(', ');

    return api.sendMessage(`Viết tắt không hợp lệ. Vui lòng chọn viết tắt hợp lệ từ danh sách:\n${suggestedTypes}`, threadID);
  }

  const userInvestments = readUserInvestments();
  const currentTime = moment();
  const lastInvestmentTime = userInvestments[senderID]?.lastInvestmentTime || moment().subtract(2, 'minutes');

  if (currentTime.diff(moment(lastInvestmentTime), 'minutes') < 2) {
    return api.sendMessage("Bạn cần đợi ít nhất 2 phút để đầu tư tiếp theo.", threadID);
  }

  const investmentCount = userInvestments[senderID]?.count || 0;
  if (opportunity.risk < 0.5 && investmentCount >= 3) {
    return api.sendMessage("Bạn đã đạt giới hạn đầu tư cho cơ hội này trong 1 giờ. Vui lòng thử lại sau.", threadID);
  }

  // Cập nhật thông tin đầu tư
  userInvestments[senderID] = {
    lastInvestmentTime: currentTime,
    count: investmentCount + 1
  };
  updateUserInvestments(userInvestments);

  const transactionFee = amount * 0.01;
  const finalInvestmentAmount = amount - transactionFee;
  const investmentOutcome = Math.random() < opportunity.risk ? 'thua lỗ' : 'lợi nhuận';
  const result = investmentOutcome === 'lợi nhuận' ? finalInvestmentAmount * opportunity.return : 0;

  await Currencies.decreaseMoney(senderID, amount); 
  await Currencies.increaseMoney(senderID, result); 

  await recordUserInvestment(senderID, opportunity.name, amount, investmentOutcome, opportunity.return);

  return api.sendMessage(`📈 Đầu tư vào "${opportunity.fullName}" ${investmentOutcome.toUpperCase()}!\n` +
    `- Rủi ro: ${opportunity.risk * 100}%\n` +
    `- Lợi nhuận: ${opportunity.return}x\n` +
    `- Bạn ${investmentOutcome === 'lợi nhuận' ? 'đã kiếm được' : 'đã mất'} ${result} xu.\n` +
    `- Tiền đầu tư: ${amount} xu (bao gồm phí giao dịch ${transactionFee} xu)\n` +
    `- Tiền nhận được: ${result} xu\n` +
    `- Bạn cần ít nhất ${amount} xu để mua cổ phiếu ${opportunity.fullName}.`, threadID);
};

async function recordUserInvestment(userID, investmentType, amount, outcome, returnRate) {
  console.log(`Ghi dữ liệu đầu tư cho người dùng ${userID}: Loại đầu tư: ${investmentType}, Số tiền: ${amount}, Kết quả: ${outcome}, Lợi nhuận: ${returnRate}`);
}

function calculateTotalProfit(investments) {
  return investments.reduce((total, inv) => total + (inv.outcome === 'lợi nhuận' ? (inv.amount - inv.amount * 0.01) * inv.return : 0), 0);
}

function analyzeRisk(investments) {
  if (investments.length === 0) return 0;
  return investments.reduce((totalRisk, inv) => totalRisk + inv.risk, 0) / investments.length;
}
