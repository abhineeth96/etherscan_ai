import { ethers } from 'ethers';

// Using a highly reliable public RPC (drpc) for Ethereum Mainnet
const provider = new ethers.JsonRpcProvider('https://eth.drpc.org');

/**
 * Determines whether the input is a Transaction Hash or an Address.
 */
export function determineInputType(input) {
  let cleanInput = input.trim();
  if (/^[A-Fa-f0-9]{64}$/.test(cleanInput)) cleanInput = '0x' + cleanInput;
  if (/^[A-Fa-f0-9]{40}$/.test(cleanInput)) cleanInput = '0x' + cleanInput;

  if (/^0x[A-Fa-f0-9]{64}$/.test(cleanInput)) {
    return { type: 'transaction', formatted: cleanInput };
  }
  
  if (/^0x[A-Fa-f0-9]{40}$/.test(cleanInput)) {
    return { type: 'address', formatted: cleanInput };
  }

  throw new Error("Invalid format. Please enter a 64-char transaction hash or a 40-char address.");
}

let cachedEthPrice = null;
let lastPriceFetchTime = 0;

async function getEthPrice() {
  const now = Date.now();
  if (cachedEthPrice && (now - lastPriceFetchTime < 60000)) return cachedEthPrice;
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
    const data = await res.json();
    if (data.ethereum?.usd) {
      cachedEthPrice = data.ethereum.usd;
      lastPriceFetchTime = now;
      return cachedEthPrice;
    }
  } catch (e) {
    console.warn("Could not fetch ETH price", e);
  }
  return null;
}

/**
 * Fetches transaction details and receipt logs.
 */
export async function getTransactionDetails(txHash) {
  try {
    const tx = await provider.getTransaction(txHash);
    if (!tx) throw new Error("Transaction not found. It might be pending or invalid.");

    const receipt = await provider.getTransactionReceipt(txHash);
    const currentBlock = await provider.getBlockNumber();
    const blockData = tx.blockNumber ? await provider.getBlock(tx.blockNumber) : null;
    const ethPrice = await getEthPrice();
    
    // Extract logs
    let logsExtractor = [];
    if (receipt && receipt.logs) {
      logsExtractor = receipt.logs.map((log) => ({
        address: log.address,
        topics: log.topics,
        data: log.data
      })).slice(0, 10);
    }

    const valueEther = ethers.formatEther(tx.value || 0n);
    const valueUsd = ethPrice ? (parseFloat(valueEther) * ethPrice).toFixed(2) : null;

    let txFeeEther = 'N/A';
    let txFeeUsd = null;
    if (receipt && tx.gasPrice) {
      const feeWei = receipt.gasUsed * tx.gasPrice;
      txFeeEther = ethers.formatEther(feeWei);
      if (ethPrice) txFeeUsd = (parseFloat(txFeeEther) * ethPrice).toFixed(4);
    }

    return {
      hash: tx.hash,
      blockNumber: tx.blockNumber,
      confirmations: tx.blockNumber ? (currentBlock - tx.blockNumber) : 0,
      timestamp: blockData ? blockData.timestamp : null,
      from: tx.from,
      to: tx.to,
      valueEther,
      valueUsd,
      gasPriceGwei: tx.gasPrice ? ethers.formatUnits(tx.gasPrice, 'gwei') : 'N/A',
      gasPriceEther: tx.gasPrice ? ethers.formatEther(tx.gasPrice) : 'N/A',
      gasLimit: tx.gasLimit ? tx.gasLimit.toString() : 'N/A',
      gasUsed: (receipt && receipt.gasUsed) ? receipt.gasUsed.toString() : 'Pending',
      txFeeEther,
      txFeeUsd,
      status: receipt ? (receipt.status === 1 ? 'Success' : 'Failed') : 'Pending',
      inputDataPreview: tx.data !== '0x' ? tx.data.substring(0, 66) + '...' : 'None (Simple Transfer)',
      logs: logsExtractor,
      originalDataLength: tx.data !== '0x' ? tx.data.length / 2 - 1 : 0
    };
  } catch (error) {
    console.error("Error fetching transaction:", error);
    throw error;
  }
}

/**
 * Checks if an address is an EOA or a Smart Contract, returning its balance and tx count.
 */
export async function getAddressDetails(address) {
  try {
    const code = await provider.getCode(address);
    const isContract = code !== '0x';
    const balanceWei = await provider.getBalance(address);
    const txCount = await provider.getTransactionCount(address);
    
    return {
      address,
      isContract,
      balanceEther: ethers.formatEther(balanceWei),
      txCount
    };
  } catch (error) {
    console.error("Error fetching address details:", error);
    throw error;
  }
}

/**
 * Fetches Smart Contract Source Code and ABI from Etherscan.
 */
export async function getContractDetails(address) {
  try {
    // We check if an API key is provided, if not we use anonymous tier 
    const apiKey = import.meta.env.VITE_ETHERSCAN_API_KEY || '';
    const apiQuery = apiKey ? `&apikey=${apiKey}` : '';
    
    const response = await fetch(`https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${address}${apiQuery}`);
    const data = await response.json();
    
    if (data.status !== '1' || !data.result || data.result[0].ABI === 'Contract source code not verified') {
      return {
        isVerified: false,
        error: "Contract source code not verified on Etherscan."
      };
    }
    
    const result = data.result[0];
    return {
      isVerified: true,
      contractName: result.ContractName,
      compilerVersion: result.CompilerVersion,
      optimizationUsed: result.OptimizationUsed,
      runs: result.Runs,
      licenseType: result.LicenseType,
      abi: result.ABI, // This is a stringified JSON array
      sourceCode: result.SourceCode // This can be quite long, but Gemini 2.5 has 1M context!
    };
  } catch (error) {
    console.error("Error fetching contract details from Etherscan:", error);
    return { isVerified: false, error: "Network error when fetching contract details." };
  }
}
