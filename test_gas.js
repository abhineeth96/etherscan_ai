import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider('https://eth.drpc.org');

async function test() {
  const hash1 = '0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060'; // Simple transfer
  const hash2 = '0x7b6f20ccca1029c99d2550cc611fc495aa9e4ce2ad19fb7aa1cd21c9faae6df8'; // Unknown but likely contract
  
  const receipt1 = await provider.getTransactionReceipt(hash1);
  console.log("Receipt 1 Gas Used:", receipt1.gasUsed.toString());

  try {
    const receipt2 = await provider.getTransactionReceipt(hash2);
    if(receipt2) console.log("Receipt 2 Gas Used:", receipt2.gasUsed.toString());
  } catch(e) {}
}

test();
