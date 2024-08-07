const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');
const { Chart, registerables } = require('chart.js');

Chart.register(...registerables);

const minCoinValue = 50;
const maxCoinValue = 150;
const cooldowns = new Map(); 
const maxTransactionsPerHour = 5;
const maxCoinsPerTransaction = 1000;
const transactionWaitTime = 2 * 60 * 1000; // 2 phút trong mili giây
let coinValue = Math.floor(Math.random() * (maxCoinValue - minCoinValue + 1)) + minCoinValue;
let previousCoinValue = coinValue;

const historicalData = Array.from({ length: 60 }, () => Math.floor(Math.random() * (maxCoinValue - minCoinValue + 1)) + minCoinValue);
const transactions = [];

function getVietnamTime() {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const vnTime = new Date(utc + (7 * 3600000)); // Việt Nam là UTC+7
    return vnTime;
}

function generateCoinChart() {
    const canvas = createCanvas(600, 300);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1c1c1c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const reversedLabels = Array.from({ length: 60 }, (_, i) => `${60 - i} phút trước`);
    const reversedData = historicalData.slice().reverse();

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: reversedLabels,
            datasets: [{
                label: 'Giá trị 1 Coin/Xu',
                data: reversedData,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#ffffff'
                    }
                },
                title: {
                    display: true,
                    text: 'GIÁ TRỊ COIN TRONG 60 PHÚT GẦN NHẤT',
                    color: '#ffffff'
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Thời Gian',
                        color: '#ffffff'
                    },
                    ticks: {
                        color: '#ffffff'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Giá Trị (Xu)',
                        color: '#ffffff'
                    },
                    ticks: {
                        color: '#ffffff'
                    }
                }
            },
            elements: {
                line: {
                    borderColor: '#00ff00',
                }
            },
            layout: {
                padding: {
                    left: 10,
                    right: 10,
                    top: 10,
                    bottom: 10
                }
            }
        }
    });

    const buffer = canvas.toBuffer('image/png');
    const chartPath = path.join(__dirname, 'cache', 'coin_chart.png');
    fs.writeFileSync(chartPath, buffer);

    return chartPath;
}

async function updateCoinValue() {
    const demand = transactions.filter(t => t.type === 'buy').length;
    const supply = transactions.filter(t => t.type === 'sell').length;

    const baseChange = Math.floor(Math.random() * (5 - (-5) + 1)) - 5;
    const adjustedChange = Math.floor(previousCoinValue * baseChange / 100);
    coinValue = Math.max(minCoinValue, Math.min(maxCoinValue, Math.round(previousCoinValue + adjustedChange)));

    if (demand > supply) {
        const demandEffect = Math.round((demand - supply) * 0.1);
        coinValue = Math.max(minCoinValue, Math.min(maxCoinValue, coinValue + demandEffect));
    } else if (supply > demand) {
        const supplyEffect = Math.round((supply - demand) * 0.1);
        coinValue = Math.max(minCoinValue, Math.min(maxCoinValue, coinValue - supplyEffect));
    }

    previousCoinValue = coinValue;

    historicalData.shift();
    historicalData.push(coinValue);
}

function isTradingAllowed() {
    const now = getVietnamTime();
    const hours = now.getHours();
    return hours >= 6 && hours < 23;
}

function isTransactionAllowed(userID, transactionType) {
    const now = getVietnamTime();
    const currentHour = now.getHours();

    let userCooldown = cooldowns.get(userID);
    if (!userCooldown) {
        userCooldown = { buy: [], sell: [], lastTransaction: 0, lastTransactionType: '' };
    }

    if (!Array.isArray(userCooldown.buy)) {
        userCooldown.buy = [];
    }
    if (!Array.isArray(userCooldown.sell)) {
        userCooldown.sell = [];
    }

    userCooldown.buy = userCooldown.buy.filter(t => t.hour === currentHour);
    userCooldown.sell = userCooldown.sell.filter(t => t.hour === currentHour);

    const timeSinceLastTransaction = now.getTime() - userCooldown.lastTransaction;

    if (timeSinceLastTransaction < transactionWaitTime && userCooldown.lastTransactionType === transactionType) {
        console.log(`Bạn phải chờ thêm ${Math.ceil((transactionWaitTime - timeSinceLastTransaction) / 1000)} giây trước khi thực hiện giao dịch ${transactionType} tiếp theo.`);
        return false;
    }

    if (transactionType === 'buy') {
        if (userCooldown.buy.length >= maxTransactionsPerHour) {
            console.log(`Đã đạt đến giới hạn giao dịch mua cho người dùng ${userID}`);
            return false;
        }
        userCooldown.buy.push({ hour: currentHour, time: now });
    } else if (transactionType === 'sell') {
        if (userCooldown.sell.length >= maxTransactionsPerHour) {
            console.log(`Đã đạt đến giới hạn giao dịch bán cho người dùng ${userID}`);
            return false;
        }
        userCooldown.sell.push({ hour: currentHour, time: now });
    }

    userCooldown.lastTransaction = now.getTime();
    userCooldown.lastTransactionType = transactionType;

    cooldowns.set(userID, userCooldown);
    return true;
}

function updateChartEveryMinute() {
    setInterval(async () => {
        await updateCoinValue();
        generateCoinChart();
    }, 60000);
}

updateChartEveryMinute();

module.exports.config = {
    name: "coin",
    version: "2.2.0",
    hasPermission: 0,
    credits: "Hoàng Ngọc Từ",
    description: "Đào coin để kiếm xu",
    commandCategory: "Kiếm Tiền",
    usePrefix: true,
    usages: ".coin | .coin check | .coin buy <số lượng> | .coin sell <số lượng> | .coin chart",
    cooldowns: 0,
};
module.exports.run = async ({ event, api, Currencies }) => {
    const { senderID, threadID } = event;
    const args = event.body.trim().split(' ');

    try {
        if (args[1] === 'check') {
            const data = await Currencies.getData(senderID);
            const currentCoins = data.coins || 0;
            const changePercentage = ((coinValue - previousCoinValue) / previousCoinValue) * 100;
            const changeDirection = changePercentage > 0 ? "tăng" : "giảm";

            const chartPath = await generateCoinChart();

            await api.sendMessage({
                body: `📌 Giá trị của 1 coin hiện tại là: ${coinValue.toLocaleString()} xu.\nSố coin hiện tại của bạn: ${currentCoins.toLocaleString()} coin.\nTỉ giá thay đổi: ${changePercentage.toFixed(2)}% (${changeDirection}).`,
                attachment: fs.createReadStream(chartPath)
            }, threadID);

            return; 
        }

        if (args[1] === 'buy') {
            if (!isTradingAllowed()) {
                return api.sendMessage("🕒 Bạn chỉ có thể mua coin từ 6 giờ sáng đến 11 giờ tối hàng ngày", threadID);
            }

            const quantity = parseInt(args[2]);

            if (!quantity || isNaN(quantity) || quantity <= 0 || quantity > maxCoinsPerTransaction) {
                return api.sendMessage(`Vui lòng nhập số lượng coin hợp lệ để mua (tối đa ${maxCoinsPerTransaction.toLocaleString()} coin).`, threadID);
            }

            if (!isTransactionAllowed(senderID, 'buy')) {
                return api.sendMessage("⏳ Bạn cần chờ thêm trước khi thực hiện giao dịch mua tiếp theo.", threadID);
            }

            const data = await Currencies.getData(senderID);
            const currentMoney = data.money || 0;
            let totalCost = Math.round(quantity * coinValue);

            // Tính phí giao dịch
            let fee = 0;
            if (quantity < 100) {
                fee = totalCost * 0.01; // 1%
            } else {
                fee = totalCost * 0.10; // 10%
            }
            totalCost += fee;

            if (totalCost > currentMoney) {
                const moneyNeeded = totalCost - currentMoney;
                return api.sendMessage(`Bạn không có đủ xu để mua ${quantity.toLocaleString()} coin.\nBạn cần thêm ${moneyNeeded.toLocaleString()} xu để thực hiện giao dịch này.`, threadID);
            }

            const newMoney = currentMoney - totalCost;
            await Currencies.setData(senderID, { money: newMoney });

            const currentCoins = data.coins || 0;
            const newCoins = currentCoins + quantity;
            await Currencies.setData(senderID, { coins: newCoins });

            transactions.push({ userID: senderID, type: 'buy', quantity });

            return api.sendMessage(`📌 Bạn đã mua thành công ${quantity.toLocaleString()} coin với giá ${totalCost.toLocaleString()} xu (bao gồm phí giao dịch).\nSố coin hiện tại của bạn: ${newCoins.toLocaleString()} coin.`, threadID);
        } else if (args[1] === 'sell') {
            if (!isTradingAllowed()) {
                return api.sendMessage("🕒 Bạn chỉ có thể bán coin từ 6 giờ sáng đến 11 giờ tối hàng ngày", threadID);
            }

            const quantity = parseInt(args[2]);

            if (!quantity || isNaN(quantity) || quantity <= 0 || quantity > maxCoinsPerTransaction) {
                return api.sendMessage(`Vui lòng nhập số lượng coin hợp lệ để bán (tối đa ${maxCoinsPerTransaction.toLocaleString()} coin).`, threadID);
            }

            if (!isTransactionAllowed(senderID, 'sell')) {
                return api.sendMessage("⏳ Bạn cần chờ thêm trước khi thực hiện giao dịch bán tiếp theo.", threadID);
            }

            const data = await Currencies.getData(senderID);
            const currentCoins = data.coins || 0;

            if (quantity > currentCoins) {
                return api.sendMessage("Bạn không có đủ coin để bán số lượng coin này.", threadID);
            }

            const newCoins = currentCoins - quantity;
            await Currencies.setData(senderID, { coins: newCoins });

            let totalEarnings = Math.round(quantity * coinValue);

            let fee = 0;
            if (quantity < 100) {
                fee = totalEarnings * 0.01; 
            } else {
                fee = totalEarnings * 0.03;
            }
            totalEarnings -= fee;

            const currentMoney = data.money || 0;
            const newMoney = currentMoney + totalEarnings;
            await Currencies.setData(senderID, { money: newMoney });

            transactions.push({ userID: senderID, type: 'sell', quantity });

            return api.sendMessage(`📌 Bạn đã bán thành công ${quantity.toLocaleString()} coin với giá ${totalEarnings.toLocaleString()} xu (sau khi trừ phí giao dịch).\nSố coin hiện tại của bạn: ${newCoins.toLocaleString()} coin.`, threadID);
        }

        if (cooldowns.has(senderID)) {
            const currentTime = Date.now();
            const cooldownTime = cooldowns.get(senderID);

            if (currentTime < cooldownTime) {
                const remainingCooldown = Math.ceil((cooldownTime - currentTime) / 1000);
                return api.sendMessage(`⏳ Bạn cần đợi thêm ${remainingCooldown} giây trước khi có thể đào coin tiếp.`, threadID);
            }
        }

        const success = Math.random() < 0.8;
        if (success) {
            const coinAmount = Math.floor(Math.random() * 10) + 5;
            const moneyEarned = Math.round(coinAmount * coinValue);

            const data = await Currencies.getData(senderID);
            const currentMoney = data.money || 0;
            const newMoney = currentMoney + moneyEarned;

            await Currencies.setData(senderID, { money: newMoney });

            await updateCoinValue();

            const currentTime = Date.now();
            const cooldownTime = currentTime + 900000;
            cooldowns.set(senderID, cooldownTime);

            return api.sendMessage(`🪙 Bạn đã đào được ${coinAmount} coin với giá ${coinValue} xu/coin.\nTổng số xu kiếm được: ${moneyEarned} xu`, threadID);
        } else {
            const penalty = Math.random() < 0.5 ? 0 : -200;
            const data = await Currencies.getData(senderID);
            const currentMoney = data.money || 0;
            const newMoney = currentMoney + penalty;

            await Currencies.setData(senderID, { money: newMoney });

            const currentTime = Date.now();
            const cooldownTime = currentTime + 300000;
            cooldowns.set(senderID, cooldownTime);

            if (penalty === 0) {
                return api.sendMessage(`Bạn đã đào một lượng nhỏ coin, nhưng không có gì xảy ra.\nSố xu hiện tại của bạn không thay đổi.`, threadID);
            } else {
                return api.sendMessage(`💣 Đào coin thất bại, bạn bị phạt -200 xu do bị Cảnh sát phát hiện.`, threadID);
            }
        }
    } catch (e) {
        console.error(e);
        return api.sendMessage("Có lỗi xảy ra trong quá trình đào coin hoặc giao dịch. Vui lòng thử lại sau.", threadID);
    }
};
