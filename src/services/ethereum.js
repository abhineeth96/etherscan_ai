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

let cachedMarketData = null;
let lastMarketFetchTime = 0;

export async function getEthMarketData() {
  const now = Date.now();
  if (cachedMarketData && (now - lastMarketFetchTime < 60000)) return cachedMarketData;
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/coins/ethereum?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false');
    const data = await res.json();
    if (data.market_data) {
      cachedMarketData = {
        currentPrice: data.market_data.current_price.usd,
        priceChange24h: data.market_data.price_change_percentage_24h,
        marketCap: data.market_data.market_cap.usd,
        volume24h: data.market_data.total_volume.usd
      };
      
      // Also update the simple price cache used by transactions
      cachedEthPrice = cachedMarketData.currentPrice;
      lastPriceFetchTime = now;
      lastMarketFetchTime = now;
      
      return cachedMarketData;
    }
  } catch (e) {
    console.warn("Could not fetch full ETH market data", e);
  }
  return null;
}

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

/**
 * Fetches the latest N blocks to generate a gas/network heatmap.
 */
export async function getRecentBlocks(count = 10) {
  try {
    const latestBlockNumber = await provider.getBlockNumber();
    const blocksData = [];
    
    // Fetch sequentially to avoid rate-limiting on free public RPCs
    for (let i = 0; i < count; i++) {
      try {
        const b = await provider.getBlock(latestBlockNumber - i);
        if (b) {
          blocksData.push({
            number: b.number,
            baseFeeGwei: b.baseFeePerGas ? parseFloat(ethers.formatUnits(b.baseFeePerGas, 'gwei')).toFixed(2) : 0,
            gasUsedRatio: b.gasLimit > 0 ? (Number(b.gasUsed) / Number(b.gasLimit)) : 0,
            timestamp: b.timestamp
          });
        }
      } catch (err) {
        console.warn(`Skipping block ${latestBlockNumber - i} due to rate limit...`);
        // Wait briefly if we get rate-limited
        await new Promise(res => setTimeout(res, 300));
      }
    }
    
    return blocksData.reverse();
    
  } catch (error) {
    console.error("Error fetching getBlockNumber:", error);
    return [];
  }
}

/**
 * Fetches data for the Homepage Feed: 6 Latest Blocks & 6 Latest Transactions.
 */
export async function getLatestFeed() {
  try {
    const latestBlockNumber = await provider.getBlockNumber();
    const blocksData = [];
    let recentTxs = [];
    
    // We only need 6 blocks for the feed
    for (let i = 0; i < 6; i++) {
      try {
        // Pass 'true' to get full transaction objects in the block (ethers v6)
        const b = await provider.getBlock(latestBlockNumber - i, true);
        if (b) {
          
          // Map to block data
          blocksData.push({
            number: b.number,
            timestamp: b.timestamp,
            miner: b.miner,
            txCount: b.transactions.length,
            baseFeeGwei: b.baseFeePerGas ? parseFloat(ethers.formatUnits(b.baseFeePerGas, 'gwei')).toFixed(2) : '0'
          });

          // If this is the absolute latest block, extract 6 transactions for the right column feed
          if (i === 0 && b.transactions.length > 0) {
            recentTxs = b.transactions.slice(0, 6).map(tx => ({
              hash: tx.hash,
              timestamp: b.timestamp, // Borrow block timestamp
              from: tx.from,
              to: tx.to,
              value: ethers.formatEther(tx.value || 0n)
            }));
          }
        }
      } catch (err) {
        console.warn(`Skipping block ${latestBlockNumber - i} for feed due to rate limit...`);
        await new Promise(res => setTimeout(res, 200));
      }
    }
    
    return { latestBlocks: blocksData, latestTransactions: recentTxs };
  } catch (error) {
    console.error("Error fetching latest feed:", error);
    return { latestBlocks: [], latestTransactions: [] };
  }
}
