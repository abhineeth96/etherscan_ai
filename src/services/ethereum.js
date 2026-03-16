import { ethers } from 'ethers';

// Using a highly reliable public RPC (drpc) for Ethereum Mainnet
const provider = new ethers.JsonRpcProvider('https://eth.drpc.org');

/**
 * Fetches transaction details and its receipt from the blockchain.
 * @param {string} txHash The Ethereum transaction hash.
 * @returns {Promise<Object>} The combined transaction and receipt data.
 */
export async function getTransactionDetails(txHash) {
  try {
    // Remove spaces, just in case
    txHash = txHash.trim();

    // Automatically prepend '0x' if the user pasted a raw 64-character hex string
    if (/^[A-Fa-f0-9]{64}$/.test(txHash)) {
      txHash = '0x' + txHash;
    }

    // Validate that it is now exactly a 66-character hex string starting with 0x
    if (!/^0x[A-Fa-f0-9]{64}$/.test(txHash)) {
      throw new Error("Invalid transaction hash format. Please ensure it is a 64-character Ethereum hex string.");
    }

    const tx = await provider.getTransaction(txHash);
    
    if (!tx) {
      throw new Error("Transaction not found on the network. It might be pending or invalid.");
    }

    const receipt = await provider.getTransactionReceipt(txHash);

    // Format values for easier reading by AI and UI
    return {
      hash: tx.hash,
      blockNumber: tx.blockNumber,
      from: tx.from,
      to: tx.to,
      valueEther: ethers.formatEther(tx.value || 0n),
      gasPriceGwei: tx.gasPrice ? ethers.formatUnits(tx.gasPrice, 'gwei') : 'N/A',
      gasLimit: tx.gasLimit ? tx.gasLimit.toString() : 'N/A',
      gasUsed: (receipt && receipt.gasUsed) ? receipt.gasUsed.toString() : 'Pending',
      status: receipt ? (receipt.status === 1 ? 'Success' : 'Failed') : 'Pending',
      inputDataPreview: tx.data !== '0x' ? tx.data.substring(0, 66) + '...' : 'None (Simple Transfer)'
    };
  } catch (error) {
    console.error("Error fetching transaction:", error);
    throw error;
  }
}
