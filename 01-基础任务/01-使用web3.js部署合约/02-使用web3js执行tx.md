#### 本章目标

通过本章的学习，可以带大家了解如何对交易进行签名，发送，接收和验证交易的执行结果，同时可以监听事件。

#### 新建一个02-tx.js

```js
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
  // 创建合约实例
  const deployContract = new web3.eth.Contract(abi);

  // 发送部署tx
  const deployTx = deployContract.deploy({
    data: bytecode,
    arguments: [111], 
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

 console.log("==============================================")

 console.log("通过getNumber获取参数的值");

 let incrementInstance = new web3.eth.Contract(abi, deployReceipt.contractAddress);
  
 let initNum = await incrementInstance.methods.getNumber().call();

 console.log(`当前初始化的num的值是： ${initNum}`);

 console.log("通过调用合约的自增的方法给合约的num附上新值");

 const newValue = 333;
 let incrementTx01 = incrementInstance.methods.increment(newValue);

 let incrementTranction = await web3.eth.accounts.signTransaction(
    {
      to:  deployReceipt.contractAddress,
      data: incrementTx01.encodeABI(),
      gas: 8000000,
    },
    account_from.privateKey
 )

 const incrementRes = await web3.eth.sendSignedTransaction(
   incrementTranction.rawTransaction
 );

 console.log(`TX sunccessful with hash ${incrementRes.transactionHash}`)
  
 console.log("调用reset方法触发事件");
  
 let incrementTx02 = incrementInstance.methods.reset();

 let incrementTranction02 = await web3.eth.accounts.signTransaction(
    {
      to:  deployReceipt.contractAddress,
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
     'wss://goerli.infura.io/ws/v3/你申请的id'
   )
 );

 let  increment = new web3Scoket.eth.Contract(abi, deployReceipt.contractAddress);
 
 increment.once('Reset',(error, event)=>{
   console.log("我是一个监听事件");
 })
 
}
Deploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

#### 修改solidity文件

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Incrementer {
    uint256 public number;
    
    // 新增了一个reset事件
    event Reset();

    constructor(uint256 _initialNumber) {
        number = _initialNumber;
    }

    function increment(uint256 _value) public {
        number = number + _value;
    }

    function reset() public {
        number = 0;
        // 触发reset事件
        emit Reset();
    }

    function getNumber() public view returns (uint256) {
        return number;
    }
}
```

