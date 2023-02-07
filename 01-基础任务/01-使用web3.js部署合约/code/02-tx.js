let Web3 = require('web3');
let solc = require('solc');
let fs = require('fs');

// 从配置中获取私钥
require('dotenv').config();
const privatekey = process.env.PRIVATE_KEY;

// 加载合约
const source = fs.readFileSync('Incrementer.sol', 'utf8');

// 编译solidity文件
const input = {
  language: 'Solidity',
  sources: {
    'Incrementer.sol': {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['*'],
      },
    },
  },
};

const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
const contractFile = tempFile.contracts['Incrementer.sol']['Incrementer'];

// 获取bin和abi
const bytecode = contractFile.evm.bytecode.object;
const abi = contractFile.abi;

// 创建一个web3的提供者
const web3 = new Web3('https://goerli.infura.io/v3/' + process.env.INFURA_ID);

//  根据私钥创建账户
const account = web3.eth.accounts.privateKeyToAccount(privatekey);
const account_from = {
  privateKey: privatekey,
  accountAddress: account.address,
};

/*
   -- 部署合约 --
*/
const Deploy = async () => {
//   // 创建合约实例
//   const deployContract = new web3.eth.Contract(abi);

//   // 发送部署tx
//   const deployTx = deployContract.deploy({
//     data: bytecode,
//     arguments: [111], 
//   });

//   // 签名tx
//   const deployTransaction = await web3.eth.accounts.signTransaction(
//     {
//       data: deployTx.encodeABI(),
//       gas: 8000000,
//     },
//     account_from.privateKey
//   );

//   const deployReceipt = await web3.eth.sendSignedTransaction(deployTransaction.rawTransaction);
//   // https://goerli.etherscan.io/address/${deployReceipt.contractAddress}
//  console.log(`Contract deployed at address: ${deployReceipt.contractAddress}`);

//  console.log("==============================================")

//  console.log("通过getNumber获取参数的值");

 let incrementInstance = new web3.eth.Contract(abi, '0x49Ea4b32ce62FA2154458ecBdEdeEA270A249A8C');
  
//  let initNum = await incrementInstance.methods.getNumber().call();

//  console.log(`当前初始化的num的值是： ${initNum}`);

//  console.log("通过调用合约的自增的方法给合约的num附上新值");

//  const newValue = 2024;
//  let incrementTx01 = incrementInstance.methods.increment(newValue);

//  let incrementTranction = await web3.eth.accounts.signTransaction(
//     {
//       to:  deployReceipt.contractAddress,
//       data: incrementTx01.encodeABI(),
//       gas: 8000000,
//     },
//     account_from.privateKey
//  )

//  const incrementRes = await web3.eth.sendSignedTransaction(
//    incrementTranction.rawTransaction
//  );

//  console.log(`TX sunccessful with hash ${incrementRes.transactionHash}`)
  
//  console.log("调用reset方法出发事件");
  
 let incrementTx02 = incrementInstance.methods.reset();

 let incrementTranction02 = await web3.eth.accounts.signTransaction(
    {
      to:  '0x49Ea4b32ce62FA2154458ecBdEdeEA270A249A8C',
      data: incrementTx02.encodeABI(),
      gas: 8000000,
    },
    account_from.privateKey
 )

 const incrementRes02 = await web3.eth.sendSignedTransaction(
  incrementTranction02.rawTransaction
 );

 console.log("---------监听事件----------");
 const web3Scoket = new Web3(
   new Web3.providers.WebsocketProvider(
     'wss://goerli.infura.io/ws/v3/83287171c6344aa2bd4df70877dabb06'
   )
 );

 let  increment = new web3Scoket.eth.Contract(abi, '0x49Ea4b32ce62FA2154458ecBdEdeEA270A249A8C');
 
 increment.once('Reset',(error, event)=>{
   console.log("我是一个监听事件");
   console.log(event)
 })
 
}
Deploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });