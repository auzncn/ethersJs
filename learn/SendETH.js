import { ethers } from "ethers";
//rinkeby 测试网络
const provider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/eth_rinkeby");
const wallet1 = new ethers.Wallet.createRandom();
const wallet1WithProvider = wallet1.connect(provider);
const mnemonic = wallet1.mnemonic // 获取助记词

// 利用私钥和provider创建wallet对象
const privateKey = '78c97a36f95df2e79260728d2d78b352fae084784003a347618c47ea83370db6';
const wallet2 = new ethers.Wallet(privateKey, provider);

// 从助记词创建wallet对象
const wallet3 = new ethers.Wallet.fromMnemonic(mnemonic.phrase);

const main = async() => {
    const address1 = await wallet1.getAddress();
    const address2 = await wallet2.getAddress();
    const address3 = await wallet3.getAddress();
    console.log(address1);
    console.log(address2);
    console.log(address3);
    console.log(address1 == address3);

    console.log(`\n2. 获取助记词`);
    console.log(`钱包1助记词: ${mnemonic.phrase}`);

    console.log(`\n3. 获取私钥`);
    console.log(`钱包2私钥: ${wallet2.privateKey}`);

    console.log(`\n4. 获取链上交易次数`);
    const txCount1 = await wallet1WithProvider.getTransactionCount();
    const txCount2 = await wallet2.getTransactionCount();
    console.log(`钱包1发送交易次数: ${txCount1}`);
    console.log(`钱包2发送交易次数: ${txCount2}`);
    
    // 5. 发送ETH
    // 如果这个钱包没rinkeby测试网ETH了，去水龙头领一些，钱包地址: 0xe16C1623c1AA7D919cd2241d8b36d9E79C1Be2A2
    // 1. chainlink水龙头: https://faucets.chain.link/rinkeby
    // 2. paradigm水龙头: https://faucet.paradigm.xyz/
    console.log(`\n5. 发送ETH（测试网）`);
    // i. 打印交易前余额
    console.log(`i. 发送前余额`)
    console.log(`钱包1: ${ethers.utils.formatEther(await wallet1WithProvider.getBalance())} ETH`)
    console.log(`钱包2: ${ethers.utils.formatEther(await wallet2.getBalance())} ETH`)
    // ii. 构造交易请求，参数：to为接收地址，value为ETH数额
    const tx = {
        to: address1,
        value: ethers.utils.parseEther("0.001")
    }
    // iii. 发送交易，获得收据
    console.log(`\nii. 等待交易在区块链确认（需要几分钟）`)
    const receipt = await wallet2.sendTransaction(tx)
    await receipt.wait() // 等待链上确认交易
    console.log(receipt) // 打印交易详情
    // iv. 打印交易后余额
    console.log(`\niii. 发送后余额`)
    console.log(`钱包1: ${ethers.utils.formatEther(await wallet1WithProvider.getBalance())} ETH`)
    console.log(`钱包2: ${ethers.utils.formatEther(await wallet2.getBalance())} ETH`)
}
main();