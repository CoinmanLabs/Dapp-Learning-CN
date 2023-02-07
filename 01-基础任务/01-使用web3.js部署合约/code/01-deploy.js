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
console.log(tempFile);
const contractFile = tempFile.contracts['Incrementer.sol']['Incrementer'];
console.log(tempFile.contracts['Incrementer.sol']['Incrementer'])

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
  // 创建合约实例
  const deployContract = new web3.eth.Contract(abi);

  // 发送部署tx
  const deployTx = deployContract.deploy({
    data: bytecode,
    arguments: [0], 
  });

  // 签名tx
  const deployTransaction = await web3.eth.accounts.signTransaction(
    {
      data: deployTx.encodeABI(),
      gas: 8000000,
    },
    account_from.privateKey
  );

  const deployReceipt = await web3.eth.sendSignedTransaction(deployTransaction.rawTransaction);
  // https://goerli.etherscan.io/address/${deployReceipt.contractAddress}
 console.log(`Contract deployed at address: ${deployReceipt.contractAddress}`);
};

Deploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });