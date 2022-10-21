import { ethers } from "ethers";
import address from './static/ListendAddress.json' assert { type: 'json' };
const addressMap = new Map();
for (let i = 0; i < address.length; i++) {
    let k = address[i][0].toUpperCase()
    let v = address[i][1]
    addressMap.set(k,v)
}

// 1. 创建provider和wallet，监听事件时候推荐用wss连接而不是http
console.log("\n1. 连接 wss RPC")
// 准备 alchemy API 可以参考https://github.com/AmazingAng/WTFSolidity/blob/main/Topics/Tools/TOOL04_Alchemy/readme.md 
// const ALCHEMY_MAINNET_WSSURL = 'wss://eth-mainnet.g.alchemy.com/v2/oKmOQKbneVkxgHZfibs-iFhIlIAl6HDN';
// const ALCHEMY_MAINNET_WSSURL = 'wss://eth-goerli.g.alchemy.com/v2/7KP9XQB5Fpr-NhcLKkYTQHuEVuA3yc8d';
const ALCHEMY_MAINNET_WSSURL = 'wss://goerli.infura.io/ws/v3/2b266dcedcea4e04b9dafe37bb254313';
const provider = new ethers.providers.WebSocketProvider(ALCHEMY_MAINNET_WSSURL);
let network = provider.getNetwork()
network.then(res => console.log(`[${(new Date).toLocaleTimeString()}] 连接到 chain ID ${res.chainId}`));

const TRANSFER_KECCAK = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
const WITHDRAWAL_KECCAK = '0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65';
const abiERC20 = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint)",
];

// function throttle(fn, delay) {
//     let timer;
//     return function () {
//         if (!timer) {
//             fn.apply(this, arguments)
//             timer = setTimeout(() => {
//                 clearTimeout(timer)
//                 timer = null
//             }, delay)
//         }
//     }
// }

const main = async () => {
    provider.on("block", (blockNumber) => {
        if (blockNumber) {
            provider.getBlockWithTransactions(blockNumber).then(async (b) => {
                //筛选块内监听地址的交易
                let target = b.transactions.filter(tx => addressMap.has(tx.from.toUpperCase()))
                // let target = b.transactions
                if (target.length > 0) {
                    for (let i = 0; i < target.length; i++) {
                        const element = target[i];
                        //交易包含的logs
                        let receipt = await provider.getTransactionReceipt(element.hash);
                        let logs = receipt.logs
                        //转账logs
                        // let transferLogs = receipt.logs.filter(e => e.topics[0].toUpperCase() == TRANSFER_KECCAK.toUpperCase())
                        // //取款logs
                        // let withdrawalLogs = receipt.logs.filter(e => e.topics[0].toUpperCase() == WITHDRAWAL_KECCAK.toUpperCase())
                        // transferLogs.concat(withdrawalLogs)
                        let tag = addressMap.get(receipt.from.toUpperCase())
                        console.log(`\n[${(new Date).toLocaleTimeString()}] 监听到》》 ${tag}(${receipt.from}) 《《发生交易,txhash:${element.hash} `);
                        for (let j = 0; j < logs.length; j++) {
                            if (logs[j].topics[0].toUpperCase() == TRANSFER_KECCAK.toUpperCase()) {
                                if (logs[j].data && logs[j].data != "0x") {
                                    let from = ethers.utils.hexStripZeros(logs[j].topics[1])
                                    let to = ethers.utils.hexStripZeros(logs[j].topics[2])
                                    let amount = ethers.utils.formatEther(ethers.BigNumber.from(logs[j].data))
                                    let address = logs[j].address
                                    const contract = new ethers.Contract(address, abiERC20, provider);
                                    const symbol = await contract.symbol()
                                    if (to.toUpperCase() == receipt.from.toUpperCase()) {
                                        console.log(`\n进账: ${symbol}(${address})  数量: ${amount}`);
                                    } else if (from.toUpperCase() == receipt.from.toUpperCase()) {
                                        console.log(`\n出账: ${symbol}(${address})  数量: ${amount}`);
                                    }
                                }

                            }
                            else if (logs[j].topics[0].toUpperCase() == WITHDRAWAL_KECCAK.toUpperCase()) {
                                if (logs[j].data && logs[j].data != "0x") {
                                    let amount = ethers.utils.formatEther(ethers.BigNumber.from(logs[j].data))
                                    let address = logs[j].address
                                    const contract = new ethers.Contract(address, abiERC20, provider);
                                    const symbol = await contract.symbol()
                                    console.log(`\n提款进账 ${symbol}(${address})  数量: ${amount}`);
                                }
                            }

                        }
                    }
                }
            })
        }
    });
};

const main1 = async () => {
    let receipt = await provider.getTransactionReceipt("0x3c0ff8d664de04ad4a0f1e04dfe6d5787aa388ceed7c20f3d788bf816b5c4184");
    let logs = receipt.logs.filter
    console.log(logs)
    console.log(`\n[${(new Date).toLocaleTimeString()}] 监听到》》 ${receipt.from} 《《发生交易 `);
    for (let i = 0; i < logs.length; i++) {
        let from = ethers.utils.hexStripZeros(logs[i].topics[1])
        let to = ethers.utils.hexStripZeros(logs[i].topics[2])
        console.log(parseInt(logs[i].data))
        let amount = ethers.utils.formatEther(parseInt(logs[i].data))
        let address = logs[i].address
        const contract = new ethers.Contract(address, abiERC20, provider);
        let symbol = await contract.symbol()
        let transType = to.toUpperCase() == receipt.from.toUpperCase() ? "进账" : "出账"
        console.log(`\n${transType}: ${symbol}(${address})  数量: ${amount}`);
    }
}



const main3 = async () => {
    let data = "0x0000000000000000000000000000000000000000000000000004e0dc102ca78f"
    let amount = ethers.utils.hexStripZeros("0x000000000000000000000000e16c1623c1aa7d919cd2241d8b36d9e79c1be2a2")
    console.log(amount)
}

const main4 = async () => {
    let amount1 = "0x"
    console.log(amount1)
    let amount2 = ethers.utils.formatUnits(ethers.BigNumber.from(amount1))
    console.log(amount2)
}

const main5 = async () => {
    console.log(addressMap)
    console.log(addressMap.has("0xe16c1623c1aa7d919cd2241d8b36d9e79c1be2a2".toUpperCase()))
}

main()



