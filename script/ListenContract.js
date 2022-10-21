import { ethers } from "ethers";

// 准备 alchemy API  
// 可以参考https://github.com/AmazingAng/WTFSolidity/blob/main/Topics/Tools/TOOL04_Alchemy/readme.md 
// const ALCHEMY_MAINNET_URL = 'https://eth-goerli.g.alchemy.com/v2/7KP9XQB5Fpr-NhcLKkYTQHuEVuA3yc8d';
const ALCHEMY_MAINNET_URL = 'https://eth-mainnet.g.alchemy.com/v2/oKmOQKbneVkxgHZfibs-iFhIlIAl6HDN';
// 连接主网 provider
const provider = new ethers.providers.JsonRpcProvider(ALCHEMY_MAINNET_URL);

let network = provider.getNetwork()
network.then(res => console.log(`[${(new Date).toLocaleTimeString()}] 连接到 chain ID ${res.chainId}`));

// USDT的合约地址
// const contractAddress = '0x4d1892f15B03db24b55E73F9801826a56d6f0755'
const contractAddress = '0x6Ef6610d24593805144d73b13d4405E00A4E4aC7'
// 构建USDT的Transfer的ABI
const abi = [
  "event Transfer(address indexed from, address indexed to, uint value)"
];
// 生成USDT合约对象
const contractUSDT = new ethers.Contract(contractAddress, abi, provider);


const main = async () => {
  // 监听USDT合约的Transfer事件

  try{
   
    // 持续监听USDT合约
    console.log("\n2. 利用contract.on()，持续监听Transfer事件");
    contractUSDT.on('Transfer', (from, to, value)=>{
      console.log(
       // 打印结果
       `${from} -> ${to} ${ethers.utils.formatUnits(ethers.BigNumber.from(value),6)}`
      )
    })

  }catch(e){
    console.log(e);

  } 
}
main()